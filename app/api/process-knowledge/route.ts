import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured } from '@/lib/gemini';
import { uploadMediaFile } from '@/lib/storage';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { STEEL_TERMINOLOGY_PROMPT } from '@/constants/terminology';
import { StructuredKnowledgeOutput, SectionId } from '@/types';

export const maxDuration = 60; // タイムアウト延長

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob | null;
    const questionId = formData.get('questionId') as string | null;
    const questionTitle = formData.get('questionTitle') as string || '鉄骨製作トラブル相談';
    const section = ((formData.get('section') as string) || 'SEC-3') as SectionId;
    const rawTranscriptInput = formData.get('rawTranscript') as string | null;

    const imageFiles: Blob[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('image_') && value instanceof Blob) {
        imageFiles.push(value);
      }
    });

    let audioUrl = '';
    const imageUrls: string[] = [];

    // 1. メディアのアップロード
    if (audioFile) {
      audioUrl = await uploadMediaFile(audioFile, 'audio');
    }

    for (const img of imageFiles) {
      const url = await uploadMediaFile(img, 'images');
      if (url) imageUrls.push(url);
    }

    let structuredOutput: StructuredKnowledgeOutput | null = null;

    // 2. Gemini API 呼び出し
    if (isGeminiConfigured && audioFile) {
      const model = getGeminiModel('gemini-1.5-flash');
      if (model) {
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const audioPart = {
          inlineData: {
            data: audioBuffer.toString('base64'),
            mimeType: audioFile.type || 'audio/webm',
          },
        };

        const systemPrompt = `
あなたは建築鉄骨製作（ファブリケーター）および溶接品質管理（JASS 6・鉄骨精度検査基準）の高度な専門家です。
提供された音声は、ベテラン職長が鉄骨製作の質問に対して口頭で回答した内容です。

【質問タイトル】: ${questionTitle}
【工程セクション】: ${section}（SEC-1:一次加工, SEC-2:組立・仕口, SEC-3:溶接・UT・歪み, SEC-4:品質管理・検査, SEC-5:塗装・出荷）

【以下の辞書および誤変換ルールを厳格に適用し、専門用語を自動補正してください】
${STEEL_TERMINOLOGY_PROMPT}

【出力フォーマット】
マークダウンのコードブロック（\`\`\`json等）や前置きテキストは一切含めず、以下のJSONスキーマに厳密に準拠したJSON文字列のみを出力してください。
{
  "title": "簡潔なトラブル要約見出し（30文字以内）",
  "section": "${section}",
  "tags": ["キーワード2〜4個"],
  "phenomenon": "発生している不具合・相談内容の要約",
  "cause": "職長が言及した根本原因・発生メカニズム",
  "solution": "具体的な手直し方法、合格/不合格の判定ライン",
  "jass_standard": "関連するJASS 6等の精度基準・管理値",
  "prevention": "再発防止策・事前段取りのポイント",
  "raw_transcript": "文字起こし全文"
}
`;

        const result = await model.generateContent([systemPrompt, audioPart]);
        const responseText = result.response.text().trim();

        try {
          const cleanedJson = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          structuredOutput = JSON.parse(cleanedJson);
        } catch (e) {
          console.error('JSON Parse error, response was:', responseText);
        }
      }
    }

    // 3. フォールバック生成
    if (!structuredOutput) {
      const baseTranscript =
        rawTranscriptInput ||
        '現場で発生した事象に対して、定盤測定とJASS 6基準に沿った公差判定を行い、規定範囲内へ手直し矯正を実施する。';

      structuredOutput = {
        title: `${questionTitle.substring(0, 24)}の対処勘所`,
        section: section,
        tags: ['JASS6', '品質管理', '現場処置', section],
        phenomenon: `${questionTitle}に伴う寸法・溶接精度のバラつきおよび不具合。`,
        cause: '材料の残留応力、溶接施工時の入熱アンバランス、または組立治具の拘束不足。',
        solution: '校正済み測定器で測定しJASS 6許容差内であることを確認。超過時は線状加熱またはグラインダー手直し・肉盛りを実施。',
        jass_standard: 'JASS 6 鉄骨工事精度検査基準・管理許容差に準拠。',
        prevention: '作業前段取りでの基準レベル確認と溶接順序・仮止め溶接の適正管理の徹底。',
        raw_transcript: baseTranscript,
      };
    }

    // 4. Supabase DBへの保存
    let savedRecordId = `rec-${Date.now()}`;
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('knowledge_records')
          .insert({
            question_id: questionId || null,
            title: structuredOutput.title,
            section: structuredOutput.section,
            tags: structuredOutput.tags,
            phenomenon: structuredOutput.phenomenon,
            cause: structuredOutput.cause,
            solution: structuredOutput.solution,
            jass_standard: structuredOutput.jass_standard,
            prevention: structuredOutput.prevention,
            raw_transcript: structuredOutput.raw_transcript,
            audio_url: audioUrl,
            image_urls: imageUrls,
          })
          .select('id')
          .single();

        if (data) {
          savedRecordId = data.id;
        }

        if (questionId) {
          await supabaseAdmin
            .from('questions_queue')
            .update({ is_answered: true })
            .eq('id', questionId);
        }
      } catch (dbErr) {
        console.error('Supabase DB Insert Exception:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      recordId: savedRecordId,
      record: {
        id: savedRecordId,
        created_at: new Date().toISOString(),
        question_id: questionId,
        ...structuredOutput,
        audio_url: audioUrl,
        image_urls: imageUrls,
      },
    });
  } catch (error: any) {
    console.error('process-knowledge error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

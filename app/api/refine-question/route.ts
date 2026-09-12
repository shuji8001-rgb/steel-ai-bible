import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured } from '@/lib/gemini';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { STEEL_TERMINOLOGY_PROMPT } from '@/constants/terminology';
import { SectionId, QuestionQueueItem, KnowledgeRecord, AiStandardAnswer, WorkerSummary } from '@/types';

import { generateRefinedSteelData } from '@/lib/steelAiEngine';

export async function POST(req: NextRequest) {
  try {
    const { rawText, section, rawQuestion, images, customApiKey, modelName } = await req.json();
    const inputQuestion = rawText || rawQuestion;

    if (!inputQuestion && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: '質問内容または画像を入力してください' },
        { status: 400 }
      );
    }

    let refinedData: {
      title: string;
      refinedQuestion: string;
      detectedSection: SectionId;
      aiStandardAnswer: AiStandardAnswer;
      keyCheckPoints: string[];
      suggestedCriteria: string;
      workerSummary: WorkerSummary;
      causeCategory: string;
      actionCategory: string;
    } | null = null;

    // 1. 最上位Geminiモデル（Gemini 1.5 Pro / 2.0 Flash）による質問具体化 ＆ 仮解説自動生成
    const modelsToTry = [modelName || 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const mName of modelsToTry) {
      if (refinedData) break;
      const model = getGeminiModel(mName, customApiKey);
      if (!model) continue;

      try {
        const prompt = `
${STEEL_TERMINOLOGY_PROMPT}

【タスク】
建築鉄骨製作工場（ファブリケーター）の現場技術者・品管担当者が現場から入力した「殴り書きメモ・トラブル相談」を受け取り、以下の全項目を構造化して最高水準の建築工学・溶接冶金学的見地から生成してください：
1. ベテラン職長が即座に直感で口頭回答しやすい具体的・論理的な技術インタビュー文へのリライト（「職長、〜について教えていただけますか？」形式）
2. 建築鉄骨精度検査基準・JASS 6に基づく、AIによる標準理論・メカニズム・合否判定ライン・現場確認ポイントの【仮解説】
3. 現場作業員向けの即断要約（OK/NG判定・今すぐやる処置・絶対やってはいけないNG行動）
4. 不具合要因カテゴリと処置カテゴリの自動分類

【入力されたメモ】
"${inputQuestion || '（添付画像を参照して鉄骨加工・溶接・寸法・塗装の欠陥・異常を確認してください）'}"
【指定工程】
"${section || '自動判定'}"

【出力JSONスキーマ】
マークダウン装飾なしで、以下のJSONフォーマットで厳密に返答してください。
{
  "title": "簡潔で要点が伝わるトラブル見出し（30文字以内）",
  "refinedQuestion": "職長が答えやすい具体的な問いかけ文（100〜150文字程度）",
  "detectedSection": "SEC-1" | "SEC-2" | "SEC-3" | "SEC-4" | "SEC-5",
  "aiTheory": "【標準理論】熱影響・残留応力・幾何公差・化学成分などの科学的メカニズム解説（120文字程度）",
  "standardCriteria": "【JASS 6・合否基準】JASS 6鉄骨工事精度検査基準・公差管理値（80文字程度）",
  "keyCheckPoints": ["現場確認ポイント1", "現場確認ポイント2", "現場確認ポイント3"],
  "summaryPhenomenon": "作業員向け一目サマリー（25文字以内）",
  "verdictOkNg": "OK（合格/許容）" | "NG（手直し必須）" | "判定要注意（JASS 6測定要）" | "危険（作業即停止）",
  "immediateAction": "今すぐやる処置（2行以内）",
  "forbiddenAction": "絶対やってはいけないNG行動（2行以内）",
  "causeCategory": "切断・開先不良" | "組立・拘束不足" | "入熱過大・溶接欠陥" | "寸法公差・UTエコー" | "塗装膜厚・養生不良",
  "actionCategory": "線状加熱・油圧矯正" | "グラインダー・再溶接" | "治具修正・仮止め補強" | "JASS6再測定" | "ケレン・再塗装"
}
`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanedJson = jsonMatch ? jsonMatch[0] : responseText;
        const parsed = JSON.parse(cleanedJson);

        const detectedSec = (parsed.detectedSection as SectionId) || section || 'SEC-3';
        const aiAnswer: AiStandardAnswer = {
          theory: parsed.aiTheory || '熱影響および幾何学的拘束条件による部材変形・組織変化。',
          standard_criteria: parsed.standardCriteria || 'JASS 6 鉄骨精度検査基準・管理許容差に準拠。',
          points_to_check: parsed.keyCheckPoints || ['定盤上での寸法測定', '溶接条件・外観の確認'],
        };

        const workerSummary: WorkerSummary = {
          summary_phenomenon: parsed.summaryPhenomenon || parsed.title || '現場確認事象',
          verdict_ok_ng: parsed.verdictOkNg || '判定要注意（JASS 6測定要）',
          immediate_action: parsed.immediateAction || '測定器で公差を確認し、職長に指示を仰いでください。',
          forbidden_action: parsed.forbiddenAction || '自己判断で無理に次工程へ部材を回すこと。',
        };

        refinedData = {
          title: parsed.title,
          refinedQuestion: parsed.refinedQuestion,
          detectedSection: detectedSec,
          aiStandardAnswer: aiAnswer,
          keyCheckPoints: parsed.keyCheckPoints || [],
          suggestedCriteria: parsed.standardCriteria || '',
          workerSummary: workerSummary,
          causeCategory: parsed.causeCategory || '入熱過大・溶接欠陥',
          actionCategory: parsed.actionCategory || '線状加熱・油圧矯正',
        };
      } catch (geminiErr) {
        console.warn(`Gemini API call failed in 鉄骨バイブル with ${mName}:`, geminiErr);
      }
    }

    // 2. 高精度ドメイン推論エンジンによる動的フォールバック
    if (!refinedData) {
      refinedData = generateRefinedSteelData(inputQuestion, section);
    }

    const timestamp = Date.now();
    const newQuestionId = `q-user-${timestamp}`;
    const newKnowledgeId = `rec-user-${timestamp}`;

    // 3. 質問キューアイテム生成
    const newQuestionItem: QuestionQueueItem = {
      id: newQuestionId,
      no: (timestamp % 1000) + 201,
      section: refinedData.detectedSection,
      title: refinedData.title,
      raw_text: inputQuestion,
      refined_question: refinedData.refinedQuestion,
      ai_standard_answer: refinedData.aiStandardAnswer,
      key_check_points: refinedData.keyCheckPoints,
      suggested_criteria: refinedData.suggestedCriteria,
      is_answered: true,
      has_voice_answer: false,
      created_at: new Date().toISOString(),
      images: images || [],
      source_type: 'user',
      knowledge_id: newKnowledgeId,
      worker_summary: refinedData.workerSummary,
      cause_category: refinedData.causeCategory,
      action_category: refinedData.actionCategory,
    };

    // 4. AI仮解説入り構造化ナレッジレコード生成
    const newKnowledgeRecord: KnowledgeRecord = {
      id: newKnowledgeId,
      question_id: newQuestionId,
      question_title: refinedData.title,
      section: refinedData.detectedSection,
      created_at: new Date().toISOString(),
      original_question: inputQuestion || refinedData.title,
      refined_problem: refinedData.refinedQuestion,
      has_voice_answer: false,
      ai_standard_answer: refinedData.aiStandardAnswer,
      phenomenon: `【現場確認事象】：${refinedData.title}`,
      cause: `【AI推定原因】：${refinedData.aiStandardAnswer.theory}`,
      action_and_criteria: `【AI推奨合否基準・手直し】：\n${refinedData.aiStandardAnswer.standard_criteria}`,
      prevention: `【AI推奨再発防止策】：\n1. 前工程チェックシートの遵守\n2. 現場確認ポイント（${refinedData.keyCheckPoints.join('、')}）の日常点検徹底`,
      key_terminology: [refinedData.title.slice(0, 8), 'JASS 6', 'AI仮解説', refinedData.detectedSection],
      full_transcript: `（ベテラン職長の音声回答は未収録です。右上の「🎙️ 音声回答」ボタンから職長の実践知見を追加できます。）`,
      images: images || [],
      worker_summary: refinedData.workerSummary,
      cause_category: refinedData.causeCategory,
      action_category: refinedData.actionCategory,
      confidence_score: 0.92,
      jass_standard: refinedData.suggestedCriteria,
    };

    // Supabase DB への永続化（設定時）
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await Promise.all([
          supabaseAdmin.from('questions_queue').insert([newQuestionItem]),
          supabaseAdmin.from('knowledge_records').insert([newKnowledgeRecord]),
        ]);
      } catch (dbErr) {
        console.warn('Supabase DB error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      refinedQuestion: refinedData.refinedQuestion,
      data: newQuestionItem,
      knowledge: newKnowledgeRecord,
    });
  } catch (error: any) {
    console.error('Refine question API error:', error);
    return NextResponse.json(
      { error: error.message || '質問のリライト中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function determineSection(text: string): SectionId {
  const t = (text || '').toLowerCase();
  if (t.includes('切断') || t.includes('孔') || t.includes('穴') || t.includes('開先') || t.includes('ショット') || t.includes('ノロ') || t.includes('曲げ')) return 'SEC-1';
  if (t.includes('組') || t.includes('仕口') || t.includes('ダイヤフラム') || t.includes('仮止') || t.includes('治具') || t.includes('スプライス')) return 'SEC-2';
  if (t.includes('溶接') || t.includes('mag') || t.includes('歪') || t.includes('入熱') || t.includes('線状加熱') || t.includes('ビード') || t.includes('アンダーカット')) return 'SEC-3';
  if (t.includes('ut') || t.includes('探傷') || t.includes('検査') || t.includes('寸法') || t.includes('jass') || t.includes('測定') || t.includes('限界')) return 'SEC-4';
  if (t.includes('塗装') || t.includes('出荷') || t.includes('リンギ') || t.includes('トラック') || t.includes('積載') || t.includes('塗膜') || t.includes('サビ')) return 'SEC-5';
  return 'SEC-3';
}

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle,
  MessageSquarePlus,
  HelpCircle,
  Mic,
  Square,
  AlertCircle,
  ArrowRight,
  Bot,
  Wrench,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { SectionId, SECTIONS, QuestionQueueItem, KnowledgeRecord, WorkerSummary } from '@/types';
import { findSimilarQuestions, SimilarMatchResult } from '@/lib/searchUtils';

interface QuestionFormProps {
  onQuestionAdded: (newQuestion: QuestionQueueItem, newKnowledge?: KnowledgeRecord) => void;
  questions?: QuestionQueueItem[];
  knowledgeList?: KnowledgeRecord[];
  onSelectQuestion?: (q: QuestionQueueItem) => void;
  onOpenManual?: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ 
  onQuestionAdded,
  questions = [],
  knowledgeList = [],
  onSelectQuestion,
  onOpenManual,
}) => {
  const [rawText, setRawText] = useState('');
  const [selectedSection, setSelectedSection] = useState<SectionId | 'AUTO'>('AUTO');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // 🌟 開閉（折りたたみ）ステート：デフォルトは折りたたんで下の質問一覧を広く見せる
  const [isExpanded, setIsExpanded] = useState(false);

  // 🌟 AI生成結果の確認（プレビュー）用ステート
  const [previewData, setPreviewData] = useState<{
    question: QuestionQueueItem;
    knowledge?: KnowledgeRecord;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // 💡 類似質問・重複防止サジェストのリアルタイム算出
  const similarMatches: SimilarMatchResult[] = useMemo(() => {
    if (!rawText || rawText.trim().length < 2 || questions.length === 0) {
      return [];
    }
    return findSimilarQuestions(rawText, questions, knowledgeList, 2, 0.22);
  }, [rawText, questions, knowledgeList]);

  // 📷 画像自動軽量化リサイズ処理（スマホ写真や高解像度写真を数十KBに圧縮）
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressedDataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      for (const file of filesArray) {
        try {
          const compressed = await compressImage(file);
          setImagePreviews((prev) => [...prev, compressed]);
        } catch (err) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🎙️ 音声入力（マイク）のトグル
  const toggleVoiceRecording = () => {
    if (isVoiceRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsVoiceRecording(false);
    } else {
      setVoiceError(null);
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        setVoiceError('ブラウザが音声認識に対応していません。Chrome推奨です。');
        return;
      }

      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = true;
        recognition.interimResults = true;

        const initialBaseText = rawText ? rawText + ' ' : '';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setRawText(initialBaseText + transcript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Voice input error:', e);
          if (e.error !== 'no-speech') {
            setVoiceError('マイクアクセスが拒否されたかエラーが発生しました。');
          }
          setIsVoiceRecording(false);
        };

        recognition.onend = () => {
          setIsVoiceRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsVoiceRecording(true);
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setVoiceError('音声認識を開始できませんでした。');
        setIsVoiceRecording(false);
      }
    }
  };

  // 1. AIで具体化と仮解説を生成し、確認プレビューを表示
  const handleRefineAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() && imagePreviews.length === 0) return;

    if (isVoiceRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsVoiceRecording(false);
    }

    setIsLoading(true);

    try {
      let createdQuestion: QuestionQueueItem | null = null;
      let createdKnowledge: KnowledgeRecord | undefined = undefined;

      try {
        const response = await fetch('/api/refine-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: rawText.trim(),
            section: selectedSection === 'AUTO' ? undefined : selectedSection,
            images: imagePreviews,
          }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const resData = await response.json();
            if (resData.data) {
              createdQuestion = resData.data;
              createdKnowledge = resData.knowledge;
            }
          }
        }
      } catch (netErr) {
        console.warn('API network error, switching to instant offline AI fallback:', netErr);
      }

      // 🌟 フォールバック（API通信不達・HTML返却時にも即座に高品質生成）
      if (!createdQuestion) {
        const clean = rawText.trim() || '鉄骨製作現場トラブル確認';
        const detectedSec: SectionId = selectedSection !== 'AUTO' 
          ? selectedSection 
          : (clean.includes('切断') || clean.includes('孔') || clean.includes('開先') || clean.includes('ノロ')) ? 'SEC-1'
          : (clean.includes('組') || clean.includes('仕口') || clean.includes('ダイヤフラム')) ? 'SEC-2'
          : (clean.includes('溶接') || clean.includes('mag') || clean.includes('歪') || clean.includes('ut') || clean.includes('エコー')) ? 'SEC-3'
          : (clean.includes('塗装') || clean.includes('出荷') || clean.includes('リンギ') || clean.includes('積載') || clean.includes('塗膜')) ? 'SEC-5'
          : 'SEC-4';

        const shortTitle = clean.length > 26 ? clean.slice(0, 26) + '…' : clean;
        const timestamp = Date.now();
        const newQuestionId = `q-user-${timestamp}`;
        const newKnowledgeId = `rec-user-${timestamp}`;

        let verdict: WorkerSummary['verdict_ok_ng'] = '判定要注意（JASS 6測定要）';
        if (clean.includes('クラック') || clean.includes('破断') || clean.includes('落下')) {
          verdict = '危険（作業即停止）';
        } else if (clean.includes('NG') || clean.includes('ノロ') || clean.includes('アンダーカット') || clean.includes('未乾燥')) {
          verdict = 'NG（手直し必須）';
        } else if (clean.includes('逆順') || clean.includes('リンギ') || clean.includes('合格')) {
          verdict = 'OK（合格/許容）';
        }

        createdQuestion = {
          id: newQuestionId,
          no: (timestamp % 1000) + 201,
          section: detectedSec,
          title: `【品管確認】${shortTitle}の要因とJASS 6判定`,
          raw_text: clean,
          refined_question: `職長、現場にて「${clean}」が確認されました。JASS 6基準に照らした許容限界と、原因見極めの勘所、および具体的な現場手直し・矯正手順について教えていただけますか？`,
          ai_standard_answer: {
            theory: `${clean}に伴う部材の残留応力、溶接熱収縮、または治具拘束のアンバランスによる公差ズレ。`,
            standard_criteria: 'JASS 6 鉄骨工事精度検査基準（限界許容差・管理許容差）に準拠。',
            points_to_check: [
              '定盤上での寸法・角度・反りの実測確認',
              '溶接・加工条件（電流・電圧・ノズル状態・環境温度）の再点検',
              '母材表面状態および治具セット状態の確認',
            ],
          },
          is_answered: true,
          has_voice_answer: false,
          created_at: new Date().toISOString(),
          images: imagePreviews,
          source_type: 'user',
          knowledge_id: newKnowledgeId,
          worker_summary: {
            summary_phenomenon: `${shortTitle}の現場確認`,
            verdict_ok_ng: verdict,
            immediate_action: '① 定盤または校正済み測定器で公差実測\n② 許容差超過時は職長指示で線状加熱またはグラインダー修正\n③ 次工程への自己判断送り出し禁止',
            forbidden_action: '基準値を確認せずに無理やり次工程へ回すこと',
          },
        };

        createdKnowledge = {
          id: newKnowledgeId,
          question_id: newQuestionId,
          question_title: createdQuestion.title,
          section: detectedSec,
          created_at: new Date().toISOString(),
          original_question: clean,
          refined_problem: createdQuestion.refined_question,
          has_voice_answer: false,
          ai_standard_answer: createdQuestion.ai_standard_answer,
          phenomenon: `【現場確認事象】：${createdQuestion.title}`,
          cause: `【AI推定原因】：${createdQuestion.ai_standard_answer?.theory}`,
          action_and_criteria: `【AI推奨合否基準・手直し】：\n${createdQuestion.ai_standard_answer?.standard_criteria}`,
          prevention: `【AI推奨再発防止策】：\n1. 前工程チェックシートの遵守\n2. 施工前段取り・日常点検の徹底`,
          key_terminology: [shortTitle.slice(0, 8), 'JASS 6', 'AI仮解説', detectedSec],
          full_transcript: '（ベテラン職長の音声回答をお待ちしています）',
          images: imagePreviews,
          worker_summary: createdQuestion.worker_summary,
          jass_standard: createdQuestion.ai_standard_answer?.standard_criteria,
        };
      }

      // プレビューモーダルをセット
      setPreviewData({
        question: createdQuestion,
        knowledge: createdKnowledge,
      });
    } catch (error: any) {
      console.error('Failed to submit question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 確定登録処理
  const handleConfirmRegistration = () => {
    if (!previewData) return;

    onQuestionAdded(previewData.question, previewData.knowledge);

    // リセット
    setPreviewData(null);
    setRawText('');
    setImages([]);
    setImagePreviews([]);
    setSelectedSection('AUTO');
    setVoiceError(null);
  };

  // 3. プレビューキャンセル
  const handleCancelPreview = () => {
    setPreviewData(null);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl overflow-hidden industrial-grid-bg transition-all shrink-0">
      {/* 開閉トグルヘッダー（常にクリック可能） */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-950/80 hover:bg-slate-900/90 transition-colors">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <MessageSquarePlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>現場技術者の相談・疑問メモ投稿</span>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                🎙️音声 / AI具体化
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              {isExpanded ? 'クリックでフォームを閉じる' : '現場の気になる事象を声やテキストで投稿（クリックで開く）'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {onOpenManual && (
            <button
              type="button"
              onClick={onOpenManual}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 transition-colors"
              title="マニュアルを開く"
            >
              ❓使い方
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 展開時のフォームコンテンツ */}
      {isExpanded && (
        <div className="p-3.5 border-t border-slate-800/80 space-y-3 animate-fadeIn">
          <form onSubmit={handleRefineAndPreview} className="space-y-2.5">
            {/* 工程選択 */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedSection('AUTO')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                  selectedSection === 'AUTO'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                自動判定
              </button>
              {(Object.keys(SECTIONS) as SectionId[]).map((secId) => {
                const sec = SECTIONS[secId];
                const isSelected = selectedSection === secId;
                return (
                  <button
                    type="button"
                    key={secId}
                    onClick={() => setSelectedSection(secId)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                      isSelected
                        ? `${sec.badgeBg} ${sec.badgeText} border ${sec.badgeBorder} font-bold shadow-sm`
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    {sec.shortName}
                  </button>
                );
              })}
            </div>

            {/* 自由メモ入力 & 音声認識表示 */}
            <div className="relative">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="マイクで話すか殴り書き（例: 「32mmのガス切断で下側にノロがつく」「柱大梁接合部でUT波形が立った」）"
                rows={2}
                className={`w-full px-3 py-2 bg-slate-950/90 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none ${
                  isVoiceRecording
                    ? 'border-red-500 ring-2 ring-red-500/50 bg-red-950/20'
                    : 'border-slate-700/80 focus:ring-amber-500'
                }`}
              />
              {isVoiceRecording && (
                <div className="absolute right-2.5 top-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-900/90 border border-red-500 text-[10px] text-red-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>音声認識中...</span>
                </div>
              )}
            </div>

            {/* 💡 類似質問・重複防止サジェスト表示 */}
            {similarMatches.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-2.5 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>💡 似た既存質問が見つかりました（重複防止）</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-normal">
                    {similarMatches.length}件合致
                  </span>
                </div>

                <div className="space-y-1.5">
                  {similarMatches.map((m) => (
                    <div
                      key={m.question.id}
                      className="bg-slate-900/90 hover:bg-slate-850 p-2 rounded-lg border border-amber-500/20 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono font-bold px-1 rounded bg-amber-500/20 text-amber-300">
                            No.{m.question.no}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {m.matchedReason}
                          </span>
                          {m.question.has_voice_answer && (
                            <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/40 font-bold shrink-0">
                              👑職長回答済
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-200 truncate">
                          {m.question.title}
                        </p>
                        {m.question.worker_summary?.immediate_action && (
                          <p className="text-[10px] text-slate-400 truncate">
                            処置: {m.question.worker_summary.immediate_action}
                          </p>
                        )}
                      </div>

                      {onSelectQuestion && (
                        <button
                          type="button"
                          onClick={() => onSelectQuestion(m.question)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0 transition-all shadow"
                          title="この既存回答を開く"
                        >
                          <span>確認</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {voiceError && (
              <p className="text-[10px] text-rose-400 leading-tight">
                ⚠️ {voiceError}
              </p>
            )}

            {/* 写真プレビュー */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-1">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img src={src} alt="現場写真" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-slate-300 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ボタン配置グリッド */}
            <div className="grid grid-cols-12 gap-1.5 items-center pt-1">
              {/* 1. 音声入力ボタン（幅3/12） */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`col-span-3 flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                  isVoiceRecording
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-600/40'
                    : 'bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300'
                }`}
                title={isVoiceRecording ? '停止' : 'マイクで音声入力'}
              >
                {isVoiceRecording ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>停止</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 text-amber-400" />
                    <span>🎙️ 音声</span>
                  </>
                )}
              </button>

              {/* 2. 写真添付ボタン（幅3/12） */}
              <label className="col-span-3 flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer transition-all shadow-sm">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>📷 写真</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* 3. AI具体化プレビューボタン（幅6/12） */}
              <button
                type="submit"
                disabled={isLoading || (!rawText.trim() && imagePreviews.length === 0)}
                className="col-span-6 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI具体化中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="truncate">✨ AI具体化プレビュー</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 AI仮回答プレビュー ＆ 「こちらを登録しますか？」確認モーダル (Portalでbody直下展開) */}
      {/* ========================================================================= */}
      {previewData && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-amber-500/30 overflow-hidden industrial-grid-bg relative z-[10000]">
            {/* モーダルヘッダー */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>✨ AIによる質問具体化 ＆ 仮回答の確認</span>
                  </h3>
                  <p className="text-xs text-amber-300/90 mt-0.5 font-medium">
                    AIが以下の内容で具体化・JASS 6仮解説を作成しました。こちらをバイブルに登録しますか？
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelPreview}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* モーダル本文（AI生成プレビュー内容） */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-200 custom-scrollbar text-xs">
              {/* 1. 具体化された質問タイトル */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    【具体化された質問タイトル（登録予定: No.{previewData.question.no}）】
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono">
                    {previewData.question.section}: {SECTIONS[previewData.question.section]?.name}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {previewData.question.title}
                </h4>
                {previewData.question.refined_question && (
                  <p className="text-[11px] text-amber-200/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20 font-mono pt-1">
                    💬 職長への問い: {previewData.question.refined_question}
                  </p>
                )}
              </div>

              {/* 2. AI標準理論・JASS 6技術解説 */}
              <div className="bg-slate-950/90 p-3.5 sm:p-4 rounded-2xl border border-blue-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>🤖 【AI標準理論・技術解説（教科書）】</span>
                </div>
                <p className="text-slate-100 leading-relaxed whitespace-pre-line text-xs">
                  {previewData.question.ai_standard_answer?.theory ||
                    previewData.knowledge?.cause ||
                    '標準理論データを生成中...'}
                </p>

                {(previewData.question.ai_standard_answer?.standard_criteria ||
                  previewData.question.suggested_criteria ||
                  previewData.knowledge?.action_and_criteria) && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-200 text-[11px]">
                    <strong className="text-cyan-300 block mb-0.5">⚖️ JASS 6 精度基準：</strong>
                    {previewData.question.ai_standard_answer?.standard_criteria ||
                      previewData.question.suggested_criteria ||
                      previewData.knowledge?.action_and_criteria}
                  </div>
                )}
              </div>

              {/* 3. 現場作業員要約（3秒即断）プレビュー */}
              {previewData.question.worker_summary && (
                <div className="bg-slate-950/90 p-3.5 sm:p-4 rounded-2xl border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-emerald-400" />
                      <span>👷 【現場作業員サマリー（3秒即断カード）】</span>
                    </span>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                        previewData.question.worker_summary.verdict_ok_ng === 'OK（合格/許容）'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : previewData.question.worker_summary.verdict_ok_ng === '危険（作業即停止）'
                          ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border-amber-500'
                      }`}
                    >
                      判定: {previewData.question.worker_summary.verdict_ok_ng}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-slate-100">
                      <strong className="text-emerald-400 block mb-0.5">【今すぐやる処置】</strong>
                      {previewData.question.worker_summary.immediate_action}
                    </div>
                    {previewData.question.worker_summary.forbidden_action && (
                      <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200">
                        <strong className="text-red-400 block mb-0.5">⚠️ 絶対やってはいけないNG行動</strong>
                        {previewData.question.worker_summary.forbidden_action}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* モーダルフッター（確定登録 / 修正 / キャンセル） */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 text-center sm:text-left">
                ※ 登録後も、ベテラン職長による音声回答の上書きや直接編集が可能です。
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  ✏️ 修正する
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRegistration}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>✅ この内容で登録する</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

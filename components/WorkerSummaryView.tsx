'use client';

import React, { useState, useRef, useEffect } from 'react';
import { QuestionQueueItem, KnowledgeRecord, SECTIONS, SectionId } from '@/types';
import {
  HardHat,
  Search,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Wrench,
  ShieldAlert,
  ChevronRight,
  Filter,
  Mic,
  Square,
  Sparkles,
  Radio,
} from 'lucide-react';
import { findSimilarQuestions, SimilarMatchResult } from '@/lib/searchUtils';

interface WorkerSummaryViewProps {
  questions: QuestionQueueItem[];
  knowledgeList: KnowledgeRecord[];
  onSelectQuestionForDetails: (question: QuestionQueueItem) => void;
  onOpenManual?: () => void;
}

export const WorkerSummaryView: React.FC<WorkerSummaryViewProps> = ({
  questions,
  knowledgeList,
  onSelectQuestionForDetails,
  onOpenManual,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSec, setSelectedSec] = useState<string>('ALL');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // 🎙️ 音声対話・音声検索ステート
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState<{ query: string; matchedTitle: string; matchedNo: number } | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // 日本語ボイスを検索する関数
  const getJapaneseVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')) ||
      voices.find((v) => v.name.includes('Japanese') || v.name.includes('日本語') || v.name.includes('Nanami') || v.name.includes('Haruka') || v.name.includes('Kyoko') || v.name.includes('Otoya')) ||
      null
    );
  };

  // ボイスの非同期ロード対応
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 音声読み上げ
  const handleSpeakSummary = (q: QuestionQueueItem) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('お使いのブラウザは音声読み上げに対応していません。');
      return;
    }

    // すでに同じカードを再生中の場合は停止
    if (speakingId === q.id) {
      window.speechSynthesis.cancel();
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      setSpeakingId(null);
      currentUtteranceRef.current = null;
      return;
    }

    // いったん停止＆キュー詰まり解除
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);

    const verdict = q.worker_summary?.verdict_ok_ng || '要確認';
    const action = q.worker_summary?.immediate_action || '品管・職長に確認してください';
    const forbidden = q.worker_summary?.forbidden_action || '特になし';

    const text = `No.${q.no}、${q.title}。判定：${verdict}。今すぐやる処置：${action}。やってはいけないこと：${forbidden}`;
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    uttr.rate = 1.0;
    uttr.pitch = 1.0;

    const jaVoice = getJapaneseVoice();
    if (jaVoice) {
      uttr.voice = jaVoice;
    }

    // GC対策: refに保持
    currentUtteranceRef.current = uttr;

    uttr.onstart = () => {
      setSpeakingId(q.id);
    };

    uttr.onend = () => {
      setSpeakingId(null);
      currentUtteranceRef.current = null;
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };

    uttr.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setSpeakingId(null);
      currentUtteranceRef.current = null;
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };

    setSpeakingId(q.id);

    // Chromeの15秒フリーズバグ対策（定期的にresumeを実行）
    synthIntervalRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 4000);

    // cancel直後のspeakが一部ブラウザで無視される問題の対策（50ms遅延）
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(uttr);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error('speak failed:', err);
        setSpeakingId(null);
      }
    }, 50);
  };

  // 🎙️ 音声で質問・ハンズフリー即断の開始
  const handleStartVoiceSearch = () => {
    if (isVoiceSearching) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsVoiceSearching(false);
      return;
    }

    setVoiceError(null);
    setVoiceFeedback(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('お使いのブラウザは音声認識に対応していません。Chrome推奨です。');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsVoiceSearching(true);
        setVoiceQueryText('現場の気になる現象を話してください...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setVoiceQueryText(transcript);

        if (event.results[0].isFinal) {
          processVoiceQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceError(`音声認識エラー: ${event.error}`);
        setIsVoiceSearching(false);
      };

      recognition.onend = () => {
        setIsVoiceSearching(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('SpeechRecognition start failed:', err);
      setVoiceError('マイクの起動に失敗しました。');
      setIsVoiceSearching(false);
    }
  };

  // 認識した音声から類似質問を自動マッチング
  const processVoiceQuery = (query: string) => {
    if (!query.trim()) return;

    const matches = findSimilarQuestions(query, questions, knowledgeList, 1, 0.1);

    if (matches.length > 0) {
      const bestMatch = matches[0].question;
      setVoiceFeedback({
        query,
        matchedTitle: bestMatch.title,
        matchedNo: bestMatch.no,
      });
      setHighlightedCardId(bestMatch.id);

      // 自動で判定と処置を音声回答
      handleSpeakSummary(bestMatch);

      // 該当カードへスクロール
      setTimeout(() => {
        const el = document.getElementById(`worker-card-${bestMatch.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else {
      setVoiceFeedback({
        query,
        matchedTitle: '該当するトラブルが見つかりませんでした。キーワードを変えてお話しください。',
        matchedNo: 0,
      });
    }
  };

  // フィルタリング処理
  const filteredQuestions = questions.filter((q) => {
    if (selectedSec !== 'ALL' && q.section !== selectedSec) return false;

    if (verdictFilter !== 'ALL') {
      const v = q.worker_summary?.verdict_ok_ng;
      if (verdictFilter === 'OK' && v !== 'OK（合格/許容）') return false;
      if (verdictFilter === 'NG' && v !== 'NG（手直し必須）') return false;
      if (verdictFilter === 'CAUTION' && v !== '判定要注意（JASS 6測定要）') return false;
      if (verdictFilter === 'DANGER' && v !== '危険（作業即停止）') return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      (q.worker_summary?.summary_phenomenon &&
        q.worker_summary.summary_phenomenon.toLowerCase().includes(query)) ||
      (q.worker_summary?.immediate_action &&
        q.worker_summary.immediate_action.toLowerCase().includes(query)) ||
      (q.worker_summary?.forbidden_action &&
        q.worker_summary.forbidden_action.toLowerCase().includes(query)) ||
      (q.key_check_points && q.key_check_points.some((k) => k.toLowerCase().includes(query)))
    );
  });

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'OK（合格/許容）':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            OK（合格/許容）
          </span>
        );
      case 'NG（手直し必須）':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            NG（手直し必須）
          </span>
        );
      case '判定要注意（JASS 6測定要）':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            判定要注意（JASS 6測定要）
          </span>
        );
      case '危険（作業即停止）':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            危険（作業即停止）
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            判定確認中
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 現場用ヒーローヘッダー ＆ 音声即断ボタン */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden industrial-grid-bg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <HardHat className="w-7 h-7 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  現場作業員・検査員向け
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredQuestions.length}項目
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                鉄骨製作トラブル即断要約シート
              </h2>
              <p className="text-xs text-slate-300">
                迷ったらここを確認！「合否判定」「今すぐやる処置」「NG行動」が一目でわかります。
              </p>
            </div>
          </div>

          {/* 🎙️ 音声ハンズフリー即断検索ボタン */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleStartVoiceSearch}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all transform active:scale-95 ${
                isVoiceSearching
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-600/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isVoiceSearching ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>聞いています...（タップで停止）</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>🎙️ 声で質問（ハンズフリー即答）</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 音声認識フィードバック */}
        {voiceQueryText && isVoiceSearching && (
          <div className="mt-3 p-3 bg-slate-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 animate-fadeIn flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span className="font-mono">音声入力中: "{voiceQueryText}"</span>
          </div>
        )}

        {voiceFeedback && (
          <div className="mt-3 p-3 bg-slate-950/90 border border-emerald-500/50 rounded-xl text-xs text-slate-200 animate-fadeIn flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400">「{voiceFeedback.query}」への回答: </span>
              <span className="font-bold text-amber-300">
                {voiceFeedback.matchedNo > 0 ? `No.${voiceFeedback.matchedNo} ` : ''}
                {voiceFeedback.matchedTitle}
              </span>
            </div>
          </div>
        )}

        {voiceError && (
          <div className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 animate-fadeIn">
            {voiceError}
          </div>
        )}
      </div>

      {/* フィルタ & 検索バー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 industrial-grid-bg">
        {/* キーワード検索 */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="「ノロ」「UT」「縮み代」「開先」等で検索..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* 判定フィルタボタン */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setVerdictFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              verdictFilter === 'ALL'
                ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            全判定
          </button>
          <button
            onClick={() => setVerdictFilter('DANGER')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              verdictFilter === 'DANGER'
                ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            危険（即停止）
          </button>
          <button
            onClick={() => setVerdictFilter('NG')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              verdictFilter === 'NG'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NG（手直し）
          </button>
          <button
            onClick={() => setVerdictFilter('CAUTION')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              verdictFilter === 'CAUTION'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            要注意（JASS6）
          </button>
          <button
            onClick={() => setVerdictFilter('OK')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              verdictFilter === 'OK'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OK（許容）
          </button>
        </div>
      </div>

      {/* サマリーカード一覧 */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <HardHat className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold">該当する要約項目が見つかりませんでした。</p>
          <p className="text-xs mt-1">検索条件を変更してください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const sec = SECTIONS[q.section];
            const summary = q.worker_summary;
            const isHighlighted = highlightedCardId === q.id;
            const isSpeaking = speakingId === q.id;

            return (
              <div
                id={`worker-card-${q.id}`}
                key={q.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between industrial-grid-bg ${
                  isHighlighted
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-slate-900'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* カード上部 */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${sec.badgeBg} ${sec.badgeText}`}>
                        {q.section}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{q.no}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 leading-snug">
                        {q.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      {getVerdictBadge(summary?.verdict_ok_ng)}
                    </div>
                  </div>

                  {/* 現場事象 */}
                  {summary?.summary_phenomenon && (
                    <div className="mb-3 text-xs text-slate-300 font-medium">
                      <span className="text-slate-400">🔍 現象: </span>
                      {summary.summary_phenomenon}
                    </div>
                  )}

                  {/* 今すぐやる処置（アクション） */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>今すぐやる処置（現場アクション）</span>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                      {summary?.immediate_action || '定盤・JASS 6基準を確認し、職長に指示を仰ぐ。'}
                    </p>
                  </div>

                  {/* ⚠️ 絶対やってはいけないNG行動（禁忌） */}
                  {summary?.forbidden_action && (
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>⚠️ 絶対やってはいけないNG行動</span>
                      </div>
                      <p className="text-xs text-red-200 leading-relaxed font-semibold">
                        {summary.forbidden_action}
                      </p>
                    </div>
                  )}
                </div>

                {/* カードフッター */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
                  <button
                    onClick={() => handleSpeakSummary(q)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSpeaking ? '音声停止' : '音読で聞く'}</span>
                  </button>

                  <button
                    onClick={() => onSelectQuestionForDetails(q)}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>職長バイブル詳細・録音</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

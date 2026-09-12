'use client';

import React from 'react';
import { 
  X, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Scissors, 
  Truck,
  TrendingUp,
  Crown,
  Bot,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { SectionId, SECTIONS, QuestionQueueItem, KnowledgeRecord } from '@/types';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionQueueItem[];
  records: KnowledgeRecord[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  questions,
  records,
}) => {
  if (!isOpen) return null;

  const totalQuestions = questions.length;
  const voiceAnswered = questions.filter((q) => q.has_voice_answer).length;
  const voicePercent = totalQuestions > 0 ? Math.round((voiceAnswered / totalQuestions) * 100) : 0;

  // タグ集計
  const tagCounts: Record<string, number> = {};
  records.forEach((r) => {
    (r.key_terminology || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // 原因カテゴリ集計
  const causeCounts: Record<string, number> = {};
  questions.forEach((q) => {
    const c = q.cause_category || 'その他・未分類';
    causeCounts[c] = (causeCounts[c] || 0) + 1;
  });

  // 処置カテゴリ集計
  const actionCounts: Record<string, number> = {};
  questions.forEach((q) => {
    const a = q.action_category || 'その他・手直し';
    actionCounts[a] = (actionCounts[a] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col industrial-grid-bg">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                鉄骨技術伝承 進捗＆品質分析ダッシュボード
              </h3>
              <p className="text-xs text-slate-400">
                ミナミ工業 4大工程別ナレッジ蓄積 ＆ 原因・処置カテゴリ分析
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 全体KPIカード */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-400">総伝承項目数</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{totalQuestions} <span className="text-xs text-slate-500">問</span></div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> 職長肉声伝承
                </span>
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{voiceAnswered} <span className="text-xs text-slate-500">問</span></div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" /> AI標準解説
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{totalQuestions} <span className="text-xs text-slate-500">問</span></div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-300">職長伝承完了率</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300">{voicePercent}%</div>
            </div>
          </div>

          {/* 4大工程別進捗バー */}
          <div className="space-y-3 p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              4大工程別 職長肉声伝承ステータス
            </h4>
            {(Object.keys(SECTIONS) as SectionId[]).map((secId) => {
              const sec = SECTIONS[secId];
              const secQuestions = questions.filter((q) => q.section === secId);
              const secAnswered = secQuestions.filter((q) => q.has_voice_answer).length;
              const secTotal = secQuestions.length;
              const secPercent = secTotal > 0 ? Math.round((secAnswered / secTotal) * 100) : 0;

              return (
                <div key={secId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {sec.shortName} <span className="text-slate-500 font-mono">({secId})</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      {secAnswered} / {secTotal}問 ({secPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        secId === 'SEC-1' ? 'bg-amber-400' :
                        secId === 'SEC-2' ? 'bg-blue-400' :
                        secId === 'SEC-3' ? 'bg-orange-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${secPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 原因・処置カテゴリ分析グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 根本原因カテゴリ */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                トラブル根本原因カテゴリ分布
              </h4>
              <div className="space-y-2">
                {Object.entries(causeCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cat}</span>
                    <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {count}件
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 処置・手直しカテゴリ */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                現場手直し・処置カテゴリ分布
              </h4>
              <div className="space-y-2">
                {Object.entries(actionCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cat}</span>
                    <span className="font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {count}件
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 頻出技術タグクラウド */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              主要技術キーワード・JASS 6規格タグ
            </h4>
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 shadow-sm"
                >
                  <span className="text-amber-400 font-bold">#</span>
                  {tag}
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-400">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-800 text-right sticky bottom-0 bg-slate-900/95 backdrop-blur">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
};

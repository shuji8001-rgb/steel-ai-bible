'use client';

import React, { useState, useMemo } from 'react';
import { QuestionQueueItem, SectionId, SECTIONS } from '@/types';
import {
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  Sparkles,
  Mic,
  Bot,
  X,
  Crown,
  Scissors,
  Layers,
  Flame,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface QuestionIndexProps {
  questions: QuestionQueueItem[];
  selectedQuestion: QuestionQueueItem | null;
  onSelectQuestion: (question: QuestionQueueItem, autoStartInterview?: boolean) => void;
  activeSection?: string | null;
}

export const QuestionIndex: React.FC<QuestionIndexProps> = ({
  questions,
  selectedQuestion,
  onSelectQuestion,
  activeSection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VOICE_ANSWERED' | 'AI_ONLY'>('ALL');
  const [openAccordions, setOpenAccordions] = useState<Record<SectionId, boolean>>({
    'SEC-1': true,
    'SEC-2': true,
    'SEC-3': true,
    'SEC-4': true,
    'SEC-5': true,
  });

  const toggleAccordion = (secId: SectionId) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const voiceAnsweredCount = useMemo(
    () => questions.filter((q) => q.has_voice_answer).length,
    [questions]
  );
  const aiOnlyCount = questions.length - voiceAnsweredCount;

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (activeSection && q.section !== activeSection) return false;
      if (filterStatus === 'VOICE_ANSWERED' && !q.has_voice_answer) return false;
      if (filterStatus === 'AI_ONLY' && q.has_voice_answer) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = q.title.toLowerCase().includes(query);
        const inRaw = q.raw_text?.toLowerCase().includes(query) || false;
        const inRefined = q.refined_question?.toLowerCase().includes(query) || false;
        const inNo = q.no.toString().includes(query);
        if (!inTitle && !inRaw && !inRefined && !inNo) return false;
      }

      return true;
    });
  }, [questions, activeSection, filterStatus, searchQuery]);

  const groupedBySection = useMemo(() => {
    const groups: Record<SectionId, QuestionQueueItem[]> = {
      'SEC-1': [],
      'SEC-2': [],
      'SEC-3': [],
      'SEC-4': [],
      'SEC-5': [],
    };
    filteredQuestions.forEach((q) => {
      if (groups[q.section]) {
        groups[q.section].push(q);
      }
    });
    return groups;
  }, [filteredQuestions]);

  const sectionList: SectionId[] = ['SEC-1', 'SEC-2', 'SEC-3', 'SEC-4', 'SEC-5'];

  const getSectionIcon = (secId: SectionId) => {
    switch (secId) {
      case 'SEC-1': return <Scissors className="w-4 h-4 text-amber-400" />;
      case 'SEC-2': return <Layers className="w-4 h-4 text-blue-400" />;
      case 'SEC-3': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'SEC-4': return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'SEC-5': return <Truck className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl industrial-grid-bg">
      {/* 検索 ＆ 絞り込みバー */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/70 space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="No. または キーワード検索（例: ノロ、UT、縮み代、JASS6）..."
            className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 状態フィルタータブ */}
        <div className="flex items-center justify-between text-xs gap-1">
          <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全問 ({questions.length})
            </button>
            <button
              onClick={() => setFilterStatus('VOICE_ANSWERED')}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all flex items-center gap-1 ${
                filterStatus === 'VOICE_ANSWERED'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                  : 'text-amber-400 hover:text-amber-200'
              }`}
            >
              <span>👑 済</span>
              <span>({voiceAnsweredCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('AI_ONLY')}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all flex items-center gap-1 ${
                filterStatus === 'AI_ONLY'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 shadow-sm'
                  : 'text-blue-400 hover:text-blue-200'
              }`}
            >
              <span>🤖 AI仮解説</span>
              <span>({aiOnlyCount})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {filteredQuestions.length}件
          </span>
        </div>
      </div>

      {/* 5大工程アコーディオンリスト（スクロール領域） */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar min-h-0">
        {sectionList.map((secId) => {
          if (activeSection && activeSection !== secId) return null;
          const sec = SECTIONS[secId];
          const items = groupedBySection[secId] || [];
          const isOpen = openAccordions[secId];
          const secVoiceCount = items.filter((q) => q.has_voice_answer).length;

          if (items.length === 0 && searchQuery) return null;

          return (
            <div
              key={secId}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/50 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleAccordion(secId)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <div className="flex items-center gap-2">
                    {getSectionIcon(secId)}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sec.badgeBg} ${sec.badgeBorder} ${sec.badgeText}`}
                    >
                      {sec.id}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {sec.shortName}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  {secVoiceCount > 0 && (
                    <span className="text-amber-400 font-bold text-[11px] flex items-center gap-0.5">
                      👑 {secVoiceCount}済
                    </span>
                  )}
                  <span>{items.length}問</span>
                </div>
              </button>

              {isOpen && (
                <div className="p-2 pt-0 space-y-1.5 border-t border-slate-800/60 bg-slate-900/30">
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2 text-center">該当する質問はありません</p>
                  ) : (
                    items.map((q) => {
                      const isSelected = selectedQuestion?.id === q.id;
                      return (
                        <div
                          key={q.id}
                          onClick={() => onSelectQuestion(q, false)}
                          className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/40'
                              : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0 mt-0.5">
                                No.{q.no}
                              </span>
                              <p className="text-xs font-medium text-slate-200 group-hover:text-amber-300 line-clamp-2 leading-snug">
                                {q.title}
                              </p>
                            </div>

                            <span className="shrink-0">
                              {q.has_voice_answer ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/60 px-1.5 py-0.5 rounded-md shadow-sm">
                                  <span>👑</span>
                                  <span>済</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-1.5 py-0.5 rounded-md">
                                  <Bot className="w-3 h-3" />
                                  仮解説
                                </span>
                              )}
                            </span>
                          </div>

                          {/* 選択中のカード用アクションバー */}
                          {isSelected && (
                            <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-between">
                              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                                <Bot className="w-3.5 h-3.5" />
                                {q.has_voice_answer ? '職長の音声回答あり' : 'AI仮解説 ＆ 音声録音可能'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectQuestion(q, true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[11px] font-bold shadow-md shadow-orange-500/20 transition-transform active:scale-95"
                              >
                                <Mic className="w-3 h-3" />
                                <span>{q.has_voice_answer ? '追記録音' : '回答を録音'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

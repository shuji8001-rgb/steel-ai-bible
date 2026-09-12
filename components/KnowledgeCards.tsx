'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Share2,
  Copy,
  Calendar,
  Layers,
  Sparkles,
  Flame,
  Edit,
  Mic,
  Bot,
  Crown,
  HardHat,
  ShieldAlert
} from 'lucide-react';
import { SectionId, SECTIONS, KnowledgeRecord } from '@/types';
import { filterKnowledgeRecords } from '@/lib/searchUtils';

interface KnowledgeCardsProps {
  records: KnowledgeRecord[];
  activeSection: string | null;
  onOpenEditModal?: (questionId: string) => void;
  onStartAppendVoice?: (questionId: string) => void;
}

export const KnowledgeCards: React.FC<KnowledgeCardsProps> = ({
  records,
  activeSection,
  onOpenEditModal,
  onStartAppendVoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleTranscript = (id: string) => {
    setExpandedTranscripts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (record: KnowledgeRecord) => {
    const text = `【${record.question_title}】（${record.section}）\n\n■現象:\n${record.phenomenon}\n\n■原因:\n${record.cause}\n\n■処置・合否ライン:\n${record.action_and_criteria}\n\n■JASS 6基準:\n${record.jass_standard || '未設定'}\n\n■再発防止:\n${record.prevention}`;
    navigator.clipboard.writeText(text);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRecords = filterKnowledgeRecords(records, searchQuery, activeSection);

  return (
    <div className="space-y-4">
      {/* バイブルヘッダー & 検索バー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 industrial-grid-bg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>鉄骨QAナレッジバイブル</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {filteredRecords.length}件 蓄積
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              JASS 6標準理論 ＆ ベテラン職長の実践ノウハウ二重構造
            </p>
          </div>
        </div>

        {/* 検索入力 */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="バイブル内を全文検索..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* ナレッジカード一覧 */}
      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold">該当するナレッジが見つかりませんでした。</p>
          <p className="text-xs mt-1">検索条件を変更するか、上のワークスペースから職長の音声を登録してください。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRecords.map((record) => {
            const sec = SECTIONS[record.section] || SECTIONS['SEC-3'];
            const isTranscriptOpen = expandedTranscripts[record.id];
            const isCopied = copiedId === record.id;
            const aiStandard = record.ai_standard_answer;
            const workerSum = record.worker_summary;

            return (
              <article
                key={record.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/5 industrial-grid-bg"
              >
                {/* カード上部：タイトル ＆ アクション */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${sec.badgeBg} ${sec.badgeText}`}>
                        {record.section} - {sec.shortName}
                      </span>
                      {record.has_voice_answer ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Crown className="w-3 h-3 text-amber-400" />
                          職長肉声伝承済み
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                          <Bot className="w-3 h-3 text-blue-400" />
                          AI標準理論のみ
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                      {record.question_title}
                    </h3>
                  </div>

                  {/* 右側アクションボタングループ */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onStartAppendVoice && (
                      <button
                        onClick={() => onStartAppendVoice(record.question_id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 text-xs border border-orange-500/30 transition-colors"
                        title="職長音声を追記録音"
                      >
                        <Mic className="w-3.5 h-3.5 text-orange-400" />
                        <span className="hidden sm:inline">追記録音</span>
                      </button>
                    )}

                    {onOpenEditModal && (
                      <button
                        onClick={() => onOpenEditModal(record.question_id)}
                        className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-xs border border-slate-800 transition-colors"
                        title="ナレッジを編集"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => copyToClipboard(record)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors"
                      title="テキストコピー"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">コピー完了</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">共有</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 現場作業員クイック要約バナー */}
                {workerSum && (
                  <div className="mb-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200">現場クイック処置:</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {workerSum.verdict_ok_ng}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 font-medium pl-6">
                        {workerSum.immediate_action}
                      </p>
                    </div>

                    {workerSum.forbidden_action && (
                      <div className="text-[11px] text-red-300 bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-500/30 shrink-0">
                        <span className="font-bold">⚠️ NG: </span>
                        {workerSum.forbidden_action.slice(0, 32)}...
                      </div>
                    )}
                  </div>
                )}

                {/* 二重構造：1. AI標準理論解説（青系） */}
                {aiStandard && (
                  <div className="mb-5 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Bot className="w-4 h-4" />
                      <span>【AI標準理論解説・JASS 6公的基準】</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/70 rounded-xl border border-blue-500/20">
                        <span className="font-bold text-blue-300 block mb-1">■ 発生メカニズム:</span>
                        <p className="text-slate-300 leading-relaxed">{aiStandard.theory}</p>
                      </div>

                      <div className="p-3 bg-slate-950/70 rounded-xl border border-blue-500/20">
                        <span className="font-bold text-blue-300 block mb-1">■ JASS 6 / JIS公的基準:</span>
                        <p className="text-slate-200 font-semibold leading-relaxed">{aiStandard.standard_criteria}</p>
                      </div>
                    </div>

                    {aiStandard.points_to_check && aiStandard.points_to_check.length > 0 && (
                      <div className="pt-1 text-xs">
                        <span className="font-bold text-slate-300">現場確認ポイント: </span>
                        <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5">
                          {aiStandard.points_to_check.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 二重構造：2. ベテラン職長の実践ノウハウ（金/炎系） */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>【ベテラン職長の実践構造化ノウハウ】</span>
                  </div>

                  {/* 構造化コンテンツグリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* 現象 */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>発生現象・トラブル内容</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {record.phenomenon}
                      </p>
                    </div>

                    {/* 原因 */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>根本原因・現場発生メカニズム</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {record.cause}
                      </p>
                    </div>

                    {/* 処置・合否ライン */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>具体的な手直し方法・合否ライン</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {record.action_and_criteria}
                      </p>
                    </div>

                    {/* JASS 6 精度基準 */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>JASS 6 鉄骨精度・検査管理値</span>
                      </div>
                      <p className="text-xs text-amber-100 font-semibold leading-relaxed">
                        {record.jass_standard || 'JASS 6 鉄骨工事精度検査基準に準拠'}
                      </p>
                    </div>
                  </div>

                  {/* 再発防止策 */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>再発防止策・事前段取りのポイント</span>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      {record.prevention}
                    </p>
                  </div>
                </div>

                {/* 音声プレイヤー */}
                {record.audio_url && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 my-4">
                    <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-300 shrink-0">
                      職長肉声:
                    </span>
                    <audio controls src={record.audio_url} className="h-7 w-full max-w-md" />
                  </div>
                )}

                {/* 写真プレビュー */}
                {record.images && record.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2 my-3">
                    {record.images.map((url, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                        <img src={url} alt={`現場写真 ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 文字起こしアコーディオン */}
                {record.full_transcript && (
                  <div className="border-t border-slate-800/80 pt-3 mt-4">
                    <button
                      onClick={() => toggleTranscript(record.id)}
                      className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 py-1"
                    >
                      <span>📝 職長の文字起こし全文（誤変換補正済み）を確認</span>
                      {isTranscriptOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {isTranscriptOpen && (
                      <div className="mt-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic animate-fadeIn font-mono">
                        "{record.full_transcript}"
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

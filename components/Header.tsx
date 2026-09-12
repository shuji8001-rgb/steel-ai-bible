import React, { useState } from 'react';
import { 
  Building2, 
  Flame, 
  BookOpen, 
  BarChart3, 
  HelpCircle, 
  HardHat, 
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Users,
  Settings,
} from 'lucide-react';
import { SectionId, SECTIONS, MainViewMode } from '@/types';
import { AiSettingsModal } from '@/components/AiSettingsModal';

interface HeaderProps {
  totalQuestions: number;
  answeredCount: number;
  activeSection: string | null;
  onSelectSection: (section: string | null) => void;
  activeView: MainViewMode;
  onChangeView: (view: MainViewMode) => void;
  onOpenManual: (persona?: 'ENGINEER' | 'FOREMAN' | 'QC') => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalQuestions,
  answeredCount,
  activeSection,
  onSelectSection,
  activeView,
  onChangeView,
  onOpenManual,
  onResetData,
}) => {
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        
        {/* 上段：ロゴ・ブランド ＆ 主要モードタブ切替 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* 左側：企業ブランド & タイトル */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-slate-900 border border-amber-500/40 shadow-lg shadow-orange-500/20">
              <Building2 className="w-5 h-5 text-white drop-shadow" />
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-950 border border-amber-400">
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ミナミ工業
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  JASS 6 鉄骨精度・溶接品質管理
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-amber-200 bg-clip-text text-transparent">
                鉄骨技術伝承AIバイブル
              </h1>
            </div>
          </div>

          {/* 中央：3大メインビュー切り替えタブ */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => onChangeView('BIBLE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'BIBLE'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 ナレッジバイブル</span>
            </button>

            <button
              onClick={() => onChangeView('WORKER_SUMMARY')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'WORKER_SUMMARY'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>👷‍♂️ 作業員クイック要約</span>
            </button>

            <button
              onClick={() => onChangeView('ANALYTICS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'ANALYTICS'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>📊 品質分析・進捗</span>
            </button>
          </div>

          {/* 右側：進捗 ＆ 操作ボタン */}
          <div className="flex items-center gap-2">
            {/* 伝承率 */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-right">
                <div className="text-[9px] text-slate-400 leading-none">職長肉声伝承率</div>
                <div className="text-xs font-bold text-amber-400 leading-tight">
                  {answeredCount} <span className="text-[10px] text-slate-500 font-normal">/ {totalQuestions}問</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border border-amber-500/30 text-[11px] font-extrabold text-amber-300">
                {percent}%
              </div>
            </div>

            {/* AI設定ボタン */}
            <button
              onClick={() => setIsAiSettingsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              title="Gemini 1.5 Pro / 2.0 Flash / APIキー設定"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI設定</span>
            </button>

            {/* マニュアルボタン */}
            <button
              onClick={() => onOpenManual('ENGINEER')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              title="運用マニュアル"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">使い方</span>
            </button>

            {/* 初期化リセットボタン */}
            <button
              onClick={onResetData}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors shadow-sm"
              title="初期プリセットへリセット"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* 下段：4大工程クイックフィルタ */}
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto border-t border-slate-800/60 mt-2">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
            工程絞込:
          </span>
          <button
            onClick={() => onSelectSection(null)}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeSection === null
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 bg-slate-900/60'
            }`}
          >
            全工程
          </button>
          {(Object.keys(SECTIONS) as SectionId[]).map((secId) => {
            const sec = SECTIONS[secId];
            const isSelected = activeSection === secId;
            return (
              <button
                key={secId}
                onClick={() => onSelectSection(isSelected ? null : secId)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? `${sec.badgeBg} ${sec.badgeText} border ${sec.badgeBorder} font-bold shadow-sm`
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                <span>{sec.shortName}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>

    {/* AI知能モデル＆API設定モーダル */}
    <AiSettingsModal
      isOpen={isAiSettingsOpen}
      onClose={() => setIsAiSettingsOpen(false)}
    />
    </>
  );
};

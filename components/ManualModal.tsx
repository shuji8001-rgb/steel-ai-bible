'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle,
  X,
  UserCheck,
  Award,
  BarChart3,
  HardHat,
  Sparkles,
  Camera,
  Mic,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Layers,
  ArrowRight,
  Bot,
  Wrench,
  Search,
  Filter,
  Check,
  Flame,
  XCircle,
  Play,
  RotateCcw,
  Tag,
  Hammer
} from 'lucide-react';

export type ManualPersona = 'FUJITA' | 'OTAKI' | 'ADMIN' | 'WORKER';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersona?: ManualPersona;
}

export const ManualModal: React.FC<ManualModalProps> = ({
  isOpen,
  onClose,
  initialPersona = 'FUJITA',
}) => {
  const [activePersona, setActivePersona] = useState<ManualPersona>(initialPersona);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActivePersona(initialPersona);
  }, [initialPersona]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* モーダル最上部ヘッダー */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>建築鉄骨製作・溶接「技術伝承AIバイブル」ビジュアル操作マニュアル</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  JASS 6完全準拠版
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                実際の操作画面イメージを見ながら、4つの役割に応じた使い方が3分でわかります
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4視点タブ切り替えバー */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActivePersona('FUJITA')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              activePersona === 'FUJITA'
                ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30'
                : 'text-sky-300/80 hover:bg-slate-800/80'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>① 藤田技師（品管・非破壊検査UT）</span>
          </button>

          <button
            onClick={() => setActivePersona('OTAKI')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              activePersona === 'OTAKI'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-amber-300/80 hover:bg-slate-800/80'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>② 大滝工場長（溶接マイスター・回答側）</span>
          </button>

          <button
            onClick={() => setActivePersona('ADMIN')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              activePersona === 'ADMIN'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-cyan-300/80 hover:bg-slate-800/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>③ 管理者（品質分析・全体統括）</span>
          </button>

          <button
            onClick={() => setActivePersona('WORKER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              activePersona === 'WORKER'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'text-emerald-300/80 hover:bg-slate-800/80'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>④ 現場作業員（3秒即断カード）</span>
          </button>
        </div>

        {/* マニュアル本文（スクロール領域） */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200">
          {/* ① 藤田技師（品管・質問側） */}
          {activePersona === 'FUJITA' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    藤田技師（品質管理・非破壊検査UT担当）の役割
                  </h3>
                  <p className="text-xs text-sky-200/80 mt-1 leading-relaxed">
                    現場で起きた寸法狂い・溶接欠陥・UT探傷エコー判定・JASS 6規格適合の疑問を、写真付きや音声でパッと質問。AIがJASS 6条項に照らした「理論・規格解説」を即座に提示します。
                  </p>
                </div>
              </div>

              {/* ステップ1: 質問投稿 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-sky-400 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px] border border-sky-500/40">1</span>
                  <span>画面右上の「+ 現場の疑問・新規質問」をクリック</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>質問フォームでの入力（音声またはテキスト）</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 space-y-2">
                    <div className="text-[11px] text-slate-400">例：「極厚板32mmの完全溶込み溶接でUT斜角探傷時に底面エコーが出ているが、JASS 6のM検出レベルと手直し手順を教えてほしい」</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400">🎤 音声入力対応</span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400">📷 現場写真添付</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ステップ2: AI標準解説の即時確認 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-sky-400 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px] border border-sky-500/40">2</span>
                  <span>AIがJASS 6基準と技術理論を即座に自動生成</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 text-xs space-y-2">
                    <div className="font-bold text-blue-300 flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span>【AI標準理論・JASS 6解説】</span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      JASS 6 第7節「工場検査」7.4 溶接部非破壊検査に準拠。JIS Z 3060 M検出レベルにて指示長さを測定。許容値超過時はガウジング＋PT探傷確認の上、50℃以上予熱で再溶接。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ② 大滝工場長（職人・回答側） */}
          {activePersona === 'OTAKI' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    大滝工場長（鉄骨製作管理技術者1級・溶接マイスター）の役割
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                    AIの標準解説を見ながら、マイクに向かって「現場でのリアルな勘所」「手直しのコツ」「絶対にやってはいけないNG行動」を肉声で吹き込むだけ。AIが誤変換を自動補正し、黄金ナレッジへ構造化します。
                  </p>
                </div>
              </div>

              {/* インタビューワークスペースの流れ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] border border-amber-500/40">1</span>
                  <span>未回答の質問を選び、「🎙️ 音声インタビュー開始」</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">大滝工場長の語りを録音中...</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] animate-pulse">● REC 0:42</span>
                  </div>
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed">
                    「このケースはな、裏当て金の密着不良が原因だ。ルート間隔が7ミリ開いてる時は、いきなり本溶接入らずに、まず裏当て金側へ1パス捨てビードを走らせろ。それとスラグを絶対残すな！」
                  </div>
                </div>
              </div>

              {/* AI構造化出力 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] border border-amber-500/40">2</span>
                  <span>AIが「現象・原因・処置・JASS 6基準・禁止事項」へ自動整理</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                    <div className="font-bold text-amber-400 mb-1">【現場処置・合否ライン】</div>
                    <div className="text-[11px] text-slate-300">裏当て金側に1パス捨てビード施工後、完全スラグ除去して本溶接。</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-red-900/50 rounded-xl text-xs">
                    <div className="font-bold text-red-400 mb-1">【⚠️ 絶対禁止事項】</div>
                    <div className="text-[11px] text-slate-300">スラグが浮いたまま上から重ね溶接すること（融合不良の直結原因）。</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ③ 管理者（品質分析・全体統括） */}
          {activePersona === 'ADMIN' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    管理者（工場長・品質保証部長）の役割
                  </h3>
                  <p className="text-xs text-cyan-200/80 mt-1 leading-relaxed">
                    蓄積された全200問のナレッジを、5大工程別・原因別・処置別・JASS 6適合率別にリアルタイム分析。弱点工程の特定や新人教育カリキュラムの編成に活用します。
                  </p>
                </div>
              </div>

              {/* ダッシュボード機能 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="text-slate-400 text-[11px]">総ナレッジ蓄積数</div>
                  <div className="text-2xl font-black text-white">200 <span className="text-xs font-normal text-slate-400">件</span></div>
                  <div className="text-[10px] text-cyan-400">全5大工程 100%完全網羅</div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="text-slate-400 text-[11px]">JASS 6規格適合率</div>
                  <div className="text-2xl font-black text-emerald-400">100.0 <span className="text-xs font-normal text-slate-400">%</span></div>
                  <div className="text-[10px] text-emerald-400">全問JASS 6条項紐付け済み</div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="text-slate-400 text-[11px]">大滝工場長 音声収録率</div>
                  <div className="text-2xl font-black text-amber-400">100 <span className="text-xs font-normal text-slate-400">%</span></div>
                  <div className="text-[10px] text-amber-400">全問マイスター知見完備</div>
                </div>
              </div>
            </div>
          )}

          {/* ④ 現場作業員（3秒即断カード） */}
          {activePersona === 'WORKER' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    現場作業員（組立・溶接・検査工）の役割
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                    作業中に「これ合ってるか？」「手直しが必要か？」と迷ったとき、スマホやタブレットで該当カードを開けば、3秒で「OK / NG / 判定要注意」と今やるべき処置・絶対禁止事項が直感的に分かります。
                  </p>
                </div>
              </div>

              {/* 現場3秒即断カードのモック */}
              <div className="p-4 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-3 shadow-xl shadow-emerald-950/50">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                    ✅ OK（合格 / 許容）
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">JASS 6 第4節準拠</span>
                </div>
                <div className="font-bold text-sm text-white">
                  切断端面のノッチ深さ0.8mmの合否判定
                </div>
                <div className="p-3 bg-slate-900 rounded-xl space-y-1.5 text-xs">
                  <div className="text-emerald-400 font-bold">🛠️ 今すぐやること:</div>
                  <div className="text-slate-300">ディスクグラインダーで深さの4倍以上の長さで滑らかに削り落とす。</div>
                </div>
                <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl space-y-1.5 text-xs">
                  <div className="text-red-400 font-bold">⚠️ 絶対禁止事項:</div>
                  <div className="text-slate-300">深さ1mm以下の微小ノッチに安易に肉盛り溶接して母材を熱劣化させること。</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* モーダル最下部フッター */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            ミナミ工業 建築鉄骨製作・溶接品質保証システム
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  Volume2, 
  Mic, 
  CheckCircle2, 
  Building2,
  ShieldCheck,
  Smartphone,
  BookOpen,
  HardHat,
  UserCheck,
  FileCheck,
  Crown
} from 'lucide-react';

export type ManualPersona = 'ENGINEER' | 'FOREMAN' | 'QC';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPersona?: ManualPersona;
}

export const ManualModal: React.FC<ManualModalProps> = ({
  isOpen,
  onClose,
  defaultPersona = 'ENGINEER',
}) => {
  const [selectedPersona, setSelectedPersona] = useState<ManualPersona>(defaultPersona);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col industrial-grid-bg">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                鉄骨技術伝承AIバイブル 運用マニュアル
              </h3>
              <p className="text-xs text-slate-400">
                ミナミ工業 現場技術者・職長・品質管理のための完全ガイド
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

        {/* ペルソナ切り替えタブ */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedPersona('ENGINEER')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                selectedPersona === 'ENGINEER'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>現場技術者・若手</span>
            </button>

            <button
              onClick={() => setSelectedPersona('FOREMAN')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                selectedPersona === 'FOREMAN'
                  ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-md shadow-orange-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>ベテラン職長</span>
            </button>

            <button
              onClick={() => setSelectedPersona('QC')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                selectedPersona === 'QC'
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>検査員・品質管理</span>
            </button>
          </div>
        </div>

        {/* マニュアル本文 */}
        <div className="p-6 space-y-6">
          
          {/* 1. 現場技術者向けマニュアル */}
          {selectedPersona === 'ENGINEER' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">1</span>
                  現場のトラブルや疑問をスマホで殴り書きメモ投稿
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  寸法狂い、開先ズレ、溶接欠陥、歪みなど、気になる事象を箇条書きや短い言葉で入力してください。専門用語がわからなくても大丈夫です。
                </p>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-slate-200">💡 メモの書き方例：</div>
                  <p className="text-slate-400 italic">「大梁のフランジ溶接でUTかけたら波形が引っかかった。どうやってハツって直せばいい？」</p>
                  <div className="pt-2 text-amber-300 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Geminiが職長が答えやすい「見極めの勘所」「手直し基準」「JASS 6管理値」を含む具体的問いに自動リライトします。</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">2</span>
                  回答されたバイブルで判定ラインを確認
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  職長が口頭回答すると、即座に「現象・原因・処置・JASS 6基準・再発防止」に整理されたカードが生成されます。「共有コピー」ボタンでLINEやメールで現場共有も可能です。
                </p>
              </div>
            </div>
          )}

          {/* 2. ベテラン職長向けマニュアル */}
          {selectedPersona === 'FOREMAN' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs">1</span>
                  「🔊 質問を聞いて口頭回答する」ボタンをタップ
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  画面のボタンを押すと、スマホがAI音声で質問を読み上げ、読み上げ完了と同時にマイクが自動起動（赤く点滅）します。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>① 質問の音読</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">職長に向かってAIが問いかけます。</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                      <Mic className="w-4 h-4 text-red-400" />
                      <span>② 口頭で話すだけ</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">「定盤のレベルを見て」「線状加熱は650度以下で」など五感の勘所をお話しください。</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs">2</span>
                  専門用語はAIが自動補正・構造化
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  話し終わったら「停止」を押し「AIバイブルへ登録」を押すだけ。現場用語（「ノロ」「開先」「裏当て金」「UT」「BCR」「線状加熱」等）は誤変換なく正式名称で登録されます。
                </p>
              </div>
            </div>
          )}

          {/* 3. 検査員・品質管理向けマニュアル */}
          {selectedPersona === 'QC' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">1</span>
                  「👷‍♂️ 作業員クイック要約」で合否ラインを即断
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  画面上部の「👷‍♂️ 作業員クイック要約」タブを開くと、「OK」「NG」「判定要注意（JASS 6測定要）」「危険」の4色カードで手直し要否を即座に判断できます。
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-emerald-300">🎙️ 声で質問（ハンズフリー即答）: </span>
                  手袋をしたままマイクボタンを押して「大梁の反り」「UTの融合不良」と話しかけるだけで、該当する判定と処置を自動で音声回答します。
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">2</span>
                  「📊 品質分析・進捗」で全社弱点を可視化
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  一次加工・組立・溶接・出荷の工程別ナレッジ蓄積率や、頻出するトラブル原因カテゴリ（入熱、拘束不足、材料品質等）の分布をリアルタイム分析できます。
                </p>
              </div>
            </div>
          )}

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
    </div>,
    document.body
  );
};

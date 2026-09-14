'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, X, Copy, Check, Smartphone } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  defaultUrl?: string;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  title = '鉄骨技術伝承AIバイブル',
  defaultUrl = 'https://steel-tech-bible.vercel.app/',
}) => {
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.href) {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=0f172a&margin=10`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0f172a] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl shadow-amber-500/20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ヘッダー */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>📱 スマートフォン用 QRコード</span>
            </h2>
            <p className="text-xs text-amber-300/80 font-medium line-clamp-1">{title}</p>
          </div>
        </div>

        {/* QRコード画像コンテナ */}
        <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-900 to-[#020617] rounded-xl border border-slate-800/80 shadow-inner mb-4">
          <div className="p-3 bg-white rounded-xl shadow-lg ring-2 ring-amber-500/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt="QR Code"
              width={220}
              height={220}
              className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] object-contain rounded-lg"
            />
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-xs text-slate-300 font-medium text-center">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>スマホのカメラで読み取って、工場・現場で即座に活用</span>
          </div>
        </div>

        {/* URL表示＆コピー */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>共有URL:</span>
            {copied && (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold animate-fadeIn">
                <Check className="w-3 h-3" /> クリップボードにコピーしました！
              </span>
            )}
          </label>
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-xl p-1.5 pl-3">
            <span className="text-xs font-mono text-amber-300 truncate flex-1 select-all">
              {currentUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/30 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>コピー済</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* フッター閉じるボタン */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

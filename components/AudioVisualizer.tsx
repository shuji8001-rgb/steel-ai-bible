'use client';

import React from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording }) => {
  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2 bg-slate-900/80 border border-orange-500/40 rounded-xl backdrop-blur-sm">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mr-2" />
      <span className="text-xs font-semibold text-orange-400 tracking-wider mr-3">
        職長音声録音中...
      </span>
      <div className="flex items-center gap-1 h-6">
        <span className="w-1.5 bg-orange-500 rounded-full wave-bar-1" />
        <span className="w-1.5 bg-amber-400 rounded-full wave-bar-2" />
        <span className="w-1.5 bg-red-500 rounded-full wave-bar-3" />
        <span className="w-1.5 bg-orange-400 rounded-full wave-bar-4" />
        <span className="w-1.5 bg-amber-500 rounded-full wave-bar-5" />
        <span className="w-1.5 bg-orange-500 rounded-full wave-bar-2" />
        <span className="w-1.5 bg-red-400 rounded-full wave-bar-4" />
      </div>
    </div>
  );
};

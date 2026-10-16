import React from 'react';
import {
  SkipBack,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Play,
  Pause,
  Sparkles,
  X,
  History,
} from 'lucide-react';

interface ReplayControlsProps {
  currentMoveIndex: number;
  totalMoves: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onOpenAdvisor: () => void;
  onExitReplay: () => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentMoveIndex,
  totalMoves,
  isPlaying,
  onTogglePlay,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onOpenAdvisor,
  onExitReplay,
}) => {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-neutral-900/95 border border-amber-500/40 rounded-2xl p-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-white">
        {/* Match info */}
        <div className="flex items-center gap-2 text-xs">
          <History className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-neutral-200">وضع إعادة التشغيل والتحليل:</span>
          <span className="bg-neutral-800 px-2 py-0.5 rounded font-mono text-amber-300 font-bold">
            {currentMoveIndex} / {totalMoves}
          </span>
        </div>

        {/* Step playback buttons */}
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            onClick={onFirst}
            disabled={currentMoveIndex === 0}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 transition-all cursor-pointer"
            title="البداية"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onPrev}
            disabled={currentMoveIndex === 0}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 transition-all cursor-pointer"
            title="النقلة السابقة"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all cursor-pointer shadow-md"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل تلقائي'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentMoveIndex === totalMoves}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 transition-all cursor-pointer"
            title="النقلة التالية"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onLast}
            disabled={currentMoveIndex === totalMoves}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 transition-all cursor-pointer"
            title="النهاية"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Advisor & Exit buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAdvisor}
            className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="تحليل هذه الوضعية بالذكاء الاصطناعي"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تحليل الموقف</span>
          </button>

          <button
            type="button"
            onClick={onExitReplay}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="الخروج من وضع إعادة التشغيل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

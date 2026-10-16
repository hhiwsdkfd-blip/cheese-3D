import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PieceColor, GameMode } from '../types/chess';
import { Trophy, RefreshCw, Home, Award } from 'lucide-react';
import { soundManager } from '../audio/soundEffects';

interface GameOverModalProps {
  winner: PieceColor | 'draw' | null;
  reason: 'checkmate' | 'stalemate' | 'draw' | 'threefold' | 'insufficient';
  gameMode: GameMode;
  totalMoves: number;
  onRematch: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  reason,
  gameMode,
  totalMoves,
  onRematch,
  onReturnToMenu,
}) => {
  useEffect(() => {
    if (winner && winner !== 'draw') {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#e0e7ff'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [winner]);

  let title = 'نهاية المباراة';
  let subtitle = '';

  if (reason === 'checkmate') {
    if (winner === 'w') {
      title = 'كش مات! فوز الأبيض 👑';
      subtitle = 'حسم اللاعب الأبيض المعركة بانتصار ملكي مستحق!';
    } else {
      title = 'كش مات! فوز الأسود 👑';
      subtitle = 'حسم اللاعب الأسود المعركة بانتصار ملكي مستحق!';
    }
  } else if (reason === 'stalemate') {
    title = 'تعادل بالمات الخانق (Stalemate)';
    subtitle = 'لا توجد نقلات قانونية والملك ليس في وضعية كش.';
  } else {
    title = 'تعادل (Draw)';
    subtitle = 'انتهت المباراة بالتعادل المتكافئ بين الطرفين.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-['Cairo',sans-serif]" dir="rtl">
      <div className="w-full max-w-md bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 md:p-8 shadow-2xl text-center text-white">
        {/* Trophy / Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          {winner && winner !== 'draw' ? (
            <Trophy className="w-8 h-8 text-amber-400" />
          ) : (
            <Award className="w-8 h-8 text-neutral-400" />
          )}
        </div>

        <h2 className="text-2xl font-black text-amber-400 mb-2">{title}</h2>
        <p className="text-sm text-neutral-300 mb-6">{subtitle}</p>

        {/* Stats card */}
        <div className="bg-neutral-800/60 border border-neutral-700/80 rounded-xl p-3.5 mb-6 text-xs flex justify-around text-neutral-300">
          <div>
            <span className="block text-neutral-400 mb-1">عدد النقلات</span>
            <span className="font-bold text-amber-300 text-base">{totalMoves}</span>
          </div>
          <div className="w-px bg-neutral-700" />
          <div>
            <span className="block text-neutral-400 mb-1">النتيجة</span>
            <span className="font-bold text-white text-base">
              {winner === 'w' ? '1 - 0' : winner === 'b' ? '0 - 1' : '½ - ½'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRematch}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>مباراة جديدة</span>
          </button>
          <button
            type="button"
            onClick={onReturnToMenu}
            className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>القائمة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

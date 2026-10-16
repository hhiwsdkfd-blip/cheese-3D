import React from 'react';
import { PieceType, PieceColor } from '../types/chess';
import { Crown, Castle, Shield, Zap } from 'lucide-react';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect }) => {
  const pieces: { type: PieceType; nameArabic: string; icon: React.ReactNode }[] = [
    { type: 'q', nameArabic: 'وزير (ملكة)', icon: <Crown className="w-7 h-7 text-amber-400" /> },
    { type: 'r', nameArabic: 'قلعة (رخ)', icon: <Castle className="w-7 h-7 text-amber-400" /> },
    { type: 'b', nameArabic: 'فيل', icon: <Shield className="w-7 h-7 text-amber-400" /> },
    { type: 'n', nameArabic: 'حصان (فارس)', icon: <Zap className="w-7 h-7 text-amber-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 font-['Cairo',sans-serif]" dir="rtl">
      <div className="w-full max-w-sm bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-center text-white">
        <h3 className="text-xl font-black text-amber-400 mb-1">ترقية البيدق</h3>
        <p className="text-xs text-neutral-400 mb-5">
          وصل البيدق إلى نهاية الرقعة! اختر القطعة التي ترغب بالترقية إليها:
        </p>

        <div className="grid grid-cols-2 gap-3">
          {pieces.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelect(item.type)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:border-amber-400 hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-full bg-neutral-900 border border-neutral-700 group-hover:border-amber-400/60 transition-all">
                {item.icon}
              </div>
              <span className="text-sm font-bold text-neutral-200 group-hover:text-amber-300">
                {item.nameArabic}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

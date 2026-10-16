import React, { useState } from 'react';
import { PieceStyleId } from '../types/chess';
import { Palette, X, Sparkles, Check, Wand2, Crown, Box, Gem } from 'lucide-react';

interface PieceCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: PieceStyleId;
  whiteColor: string;
  blackColor: string;
  onApplyCustomization: (style: PieceStyleId, whiteColor: string, blackColor: string) => void;
}

export const PieceCustomizerModal: React.FC<PieceCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  whiteColor,
  blackColor,
  onApplyCustomization,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<PieceStyleId>(currentStyle);
  const [selectedWhiteColor, setSelectedWhiteColor] = useState<string>(whiteColor);
  const [selectedBlackColor, setSelectedBlackColor] = useState<string>(blackColor);

  if (!isOpen) return null;

  const styles = [
    {
      id: 'royal' as PieceStyleId,
      nameArabic: 'الجيش الملكي المدرع (الأبيض والأسود)',
      description: 'ملوك بتيجان ذهبية فاخرة، فرسان مدرعون، حراس ملكيون، أبراج حجرية وبيادق بدروع وسيوف',
      icon: <Crown className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'classic' as PieceStyleId,
      nameArabic: 'كلاسيكي شتاونتون فاخر',
      description: 'قطع شتاونتون كلاسيكية مخرطة بعناية مع أطواق ذهبية',
      icon: <Wand2 className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'modern' as PieceStyleId,
      nameArabic: 'حديث مينيماليستي',
      description: 'أشكال أسطوانية وهندسية أنيقة بدون حشو',
      icon: <Box className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'fantasy' as PieceStyleId,
      nameArabic: 'خيالي كريستالي مشع',
      description: 'زجاج كريستالي شفاف مع انعكاسات ضوئية سحرية',
      icon: <Gem className="w-5 h-5 text-amber-400" />,
    },
  ];

  const whiteColorPresets = [
    { name: 'عاجي ملكي فاخر', hex: '#faf6ee' },
    { name: 'رخام أبيض صافي', hex: '#ffffff' },
    { name: 'ذهب إمبراطوري 24K', hex: '#ffd700' },
    { name: 'كريستال فيروزي', hex: '#67e8f9' },
    { name: 'فضي بلاتيني', hex: '#cbd5e1' },
  ];

  const blackColorPresets = [
    { name: 'أسود أوبسيديان ملكي', hex: '#121418' },
    { name: 'أسود فحمي داكن', hex: '#0a0a0c' },
    { name: 'برونز داكن عتيق', hex: '#451a03' },
    { name: 'أرجواني ملكي', hex: '#3b0764' },
    { name: 'زمردي داكن', hex: '#064e3b' },
  ];



  const handleApply = () => {
    onApplyCustomization(selectedStyle, selectedWhiteColor, selectedBlackColor);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">تخصيص مظهر قطع الشطرنج 3D</h3>
              <p className="text-[11px] text-neutral-400">اختر نمط القطع وألوان الجانبين الأبيض والأسود</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* 1. Piece Styles Selection */}
          <div>
            <label className="text-xs font-bold text-amber-300 block mb-2.5">
              نمط تصميم القطع (3-4 أنماط مختلفة):
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {styles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStyle(s.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                    selectedStyle === s.id
                      ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-neutral-800/60 border-neutral-700/80 hover:bg-neutral-800'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 mt-0.5">
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{s.nameArabic}</span>
                      {selectedStyle === s.id && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. White Pieces Color Selection */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2 flex items-center justify-between">
              <span>لون القطع البيضاء:</span>
              <span className="text-[11px] text-neutral-400 font-normal">
                المحدد: {whiteColorPresets.find((p) => p.hex === selectedWhiteColor)?.name || selectedWhiteColor}
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {whiteColorPresets.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setSelectedWhiteColor(preset.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    selectedWhiteColor === preset.hex
                      ? 'bg-neutral-800 border-amber-400 ring-1 ring-amber-400/50 text-white'
                      : 'bg-neutral-950/70 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-500 shadow-sm inline-block"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Black Pieces Color Selection */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2 flex items-center justify-between">
              <span>لون القطع السوداء:</span>
              <span className="text-[11px] text-neutral-400 font-normal">
                المحدد: {blackColorPresets.find((p) => p.hex === selectedBlackColor)?.name || selectedBlackColor}
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {blackColorPresets.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setSelectedBlackColor(preset.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    selectedBlackColor === preset.hex
                      ? 'bg-neutral-800 border-amber-400 ring-1 ring-amber-400/50 text-white'
                      : 'bg-neutral-950/70 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-600 shadow-sm inline-block"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>تطبيق التخصيص الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};

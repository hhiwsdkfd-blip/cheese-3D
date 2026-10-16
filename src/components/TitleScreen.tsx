import React from 'react';
import { GameMode, AIDifficulty, PieceColor, BoardThemeId } from '../types/chess';
import { Swords, Users, Bot, Crown, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { CHESS_THEMES } from '../three/themes';

interface TitleScreenProps {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  difficulty: AIDifficulty;
  setDifficulty: (diff: AIDifficulty) => void;
  playerColor: PieceColor;
  setPlayerColor: (color: PieceColor) => void;
  themeId: BoardThemeId;
  setThemeId: (id: BoardThemeId) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  setMode,
  difficulty,
  setDifficulty,
  playerColor,
  setPlayerColor,
  themeId,
  setThemeId,
  soundEnabled,
  setSoundEnabled,
  onStartGame,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-8 pointer-events-none select-none text-white font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 text-xs tracking-wider">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Grandmaster 3D</span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-lg bg-black/60 border border-white/10 hover:border-amber-400/50 hover:bg-black/80 transition-all text-neutral-300 hover:text-white"
          title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-neutral-400" />}
        </button>
      </div>

      {/* Center Cinematic Lockup & Start Form */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto my-auto flex flex-col items-center text-center">
        {/* Title Lockup */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجربة ثلاثية الأبعاد احترافية بالكامل</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-md">
            شطرنج الأساطير
          </h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-sm">
            محاكاة ثلاثية الأبعاد واقعية بقطع شتاونتون كلاسيكية فاخرة وذكاء اصطناعي استراتيجي
          </p>
        </div>

        {/* Options Card */}
        <div className="w-full bg-neutral-900/90 border border-amber-500/20 rounded-2xl p-5 shadow-2xl backdrop-blur-none space-y-4 text-right">
          {/* Game Mode */}
          <div>
            <label className="text-xs font-bold text-neutral-400 mb-2 block">نمط اللعب:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('vs-ai')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  mode === 'vs-ai'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>ضد الذكاء</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('pass-and-play')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  mode === 'pass-and-play'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>لاعبان (مباشر)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('ai-vs-ai')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  mode === 'ai-vs-ai'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>صراع الذكاء</span>
              </button>
            </div>
          </div>

          {/* AI Difficulty (if vs AI) */}
          {mode === 'vs-ai' && (
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">مستوى المحرك:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'novice', name: 'مبتدئ' },
                  { id: 'intermediate', name: 'متوسط' },
                  { id: 'master', name: 'أستاذ دولي' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id as AIDifficulty)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === item.id
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Piece Color (if vs AI) */}
          {mode === 'vs-ai' && (
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">لون قطعك:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerColor('w')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    playerColor === 'w'
                      ? 'bg-white text-neutral-900 border-white'
                      : 'bg-neutral-800/60 border-neutral-700 text-neutral-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-300 inline-block"></span>
                  <span>الأبيض (البدء أولاً)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerColor('b')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    playerColor === 'b'
                      ? 'bg-neutral-950 text-white border-amber-400'
                      : 'bg-neutral-800/60 border-neutral-700 text-neutral-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-600 inline-block"></span>
                  <span>الأسود (الدفاع)</span>
                </button>
              </div>
            </div>
          )}

          {/* Theme Preset */}
          <div>
            <label className="text-xs font-bold text-neutral-400 mb-1.5 block">مظهر الرقعة والقطع:</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(CHESS_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`p-2 rounded-lg border text-[11px] font-bold text-center truncate transition-all ${
                    themeId === theme.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {theme.nameArabic.split(' ')[0]} {theme.nameArabic.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA Button */}
          <button
            type="button"
            onClick={onStartGame}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-black text-base shadow-lg hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-5 h-5 text-neutral-950" />
            <span>ابدأ المعركة الملكية</span>
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="w-full text-center text-xs text-neutral-500 pointer-events-auto">
        <span>السحب للتدوير · عجلة الفأرة للتكبير · النقر لاختيار القطعة</span>
      </div>
    </div>
  );
};

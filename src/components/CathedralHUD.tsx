import React from 'react';
import {
  PieceColor,
  PieceType,
  GameMode,
  AIDifficulty,
  ChessMoveRecord,
} from '../types/chess';
import {
  Volume2,
  VolumeX,
  Palette,
  Bookmark,
  Sparkles,
  Eye,
  EyeOff,
  Bot,
  RotateCcw,
  RefreshCw,
  Clock,
  Swords,
  Languages,
} from 'lucide-react';
import { CameraPreset } from '../three/chessScene';

interface CathedralHUDProps {
  currentTurn: PieceColor;
  isCheck: boolean;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColor: PieceColor;
  capturedByWhite: PieceType[];
  capturedByBlack: PieceType[];
  whiteTime: number;
  blackTime: number;
  movesHistory: ChessMoveRecord[];
  soundEnabled: boolean;
  isUiHidden: boolean;
  activeCamera: CameraPreset;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onToggleSound: () => void;
  onToggleUiHidden: () => void;
  onCameraChange: (preset: CameraPreset) => void;
  onToggleMode: () => void;
  onTogglePlayerColor: () => void;
  onTriggerAiMove: () => void;
  onNewGame: () => void;
  onUndoMove: () => void;
  onOpenCustomizer: () => void;
  onOpenSavedGames: () => void;
  onOpenAssistant: () => void;
  isAiThinking: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const CathedralHUD: React.FC<CathedralHUDProps> = ({
  currentTurn,
  isCheck,
  gameMode,
  aiDifficulty,
  playerColor,
  capturedByWhite,
  capturedByBlack,
  whiteTime,
  blackTime,
  movesHistory,
  soundEnabled,
  isUiHidden,
  activeCamera,
  lang,
  onToggleLang,
  onToggleSound,
  onToggleUiHidden,
  onCameraChange,
  onToggleMode,
  onTogglePlayerColor,
  onTriggerAiMove,
  onNewGame,
  onUndoMove,
  onOpenCustomizer,
  onOpenSavedGames,
  onOpenAssistant,
  isAiThinking,
}) => {
  const isAr = lang === 'ar';

  // Minimal floating button when UI is hidden
  if (isUiHidden) {
    return (
      <button
        onClick={onToggleUiHidden}
        className="fixed top-4 left-4 z-40 px-3.5 py-1.5 rounded-full bg-black/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-all cursor-pointer shadow-lg"
      >
        <Eye className="w-4 h-4" />
        <span>{isAr ? 'إظهار الواجهة [H]' : 'Show UI [H]'}</span>
      </button>
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-30 font-['Cairo',sans-serif] flex flex-col justify-between"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. TOP HEADER STRIP (Matching screenshots 1, 2, 3, 4) */}
      <div className="w-full p-2.5 md:p-3 pointer-events-auto overflow-x-auto no-scrollbar">
        <div className="flex flex-wrap items-center justify-between gap-1.5 md:gap-2 max-w-[1920px] mx-auto text-xs font-bold text-neutral-200">
          {/* Right Group (Status & Mode Controls) */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {/* Turn Indicator Pill */}
            <div className="px-3 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/40 text-white flex items-center gap-2 shadow-md">
              <span
                className={`w-3 h-3 rounded-full inline-block shadow-sm ${
                  currentTurn === 'w' ? 'bg-white border border-neutral-300' : 'bg-neutral-950 border border-amber-400'
                }`}
              />
              <span>
                {currentTurn === 'w'
                  ? isAr ? 'دور الأبيض' : "White's Turn"
                  : isAr ? 'دور الأسود' : "Black's Turn"}
              </span>
              {isCheck && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500 text-white font-black animate-pulse">
                  {isAr ? 'كش!' : 'CHECK!'}
                </span>
              )}
            </div>

            {/* Play as White / Play as Black Pill */}
            <button
              onClick={onTogglePlayerColor}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700/80 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title={isAr ? 'تبديل لونك' : 'Toggle your side'}
            >
              <span>
                {playerColor === 'w'
                  ? isAr ? 'الـلعب كالأبيض' : 'Playing as White'
                  : isAr ? 'الـلعب بالأسود' : 'Playing as Black'}
              </span>
            </button>

            {/* Mode Switcher Pill */}
            <button
              onClick={onToggleMode}
              className="px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {gameMode === 'vs-ai' ? <Bot className="w-3.5 h-3.5" /> : <Swords className="w-3.5 h-3.5" />}
              <span>
                {gameMode === 'vs-ai'
                  ? isAr ? 'نمط: لاعب واحد (AI)' : 'Mode: 1 Player (AI)'
                  : isAr ? 'نمط: لاعبان (مباشر)' : 'Mode: 2 Players'}
              </span>
            </button>

            {/* Force Computer Move Pill */}
            {gameMode === 'vs-ai' && (
              <button
                onClick={onTriggerAiMove}
                disabled={isAiThinking}
                className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                <Bot className={`w-3.5 h-3.5 ${isAiThinking ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'حركة الكمبيوتر' : 'AI Move'}</span>
              </button>
            )}

            {/* New Game Button */}
            <button
              onClick={onNewGame}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'لعبة جديدة' : 'New Game'}</span>
            </button>

            {/* Undo Move Button */}
            {movesHistory.length > 0 && (
              <button
                onClick={onUndoMove}
                disabled={isAiThinking}
                className="px-2.5 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title={isAr ? 'تراجع عن النقلة' : 'Undo Move'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'تراجع' : 'Undo'}</span>
              </button>
            )}
          </div>

          {/* Center Group (Camera View Presets - as in screenshots) */}
          <div className="flex items-center gap-1 bg-neutral-950/80 p-1 rounded-full border border-neutral-800">
            <button
              onClick={() => onCameraChange('player')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeCamera === 'player'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'كاميرا اللاعب' : 'Player View'}
            </button>
            <button
              onClick={() => onCameraChange('top')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeCamera === 'top'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'منظور علوي' : 'Top View'}
            </button>
            <button
              onClick={() => onCameraChange('side')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeCamera === 'side'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'منظور جانبي' : 'Side View'}
            </button>
            <button
              onClick={() => onCameraChange('cathedral')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeCamera === 'cathedral'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'الكاتدرائية' : 'Cathedral'}
            </button>
          </div>

          {/* Left Group (Modals, Customization, Assistant, Language, Audio) */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAssistant}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-amber-400/60 text-amber-300 hover:text-white hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title={isAr ? 'المساعد الذكي وتحليل الوضعية' : 'AI Chess Assistant'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'مساعد AI' : 'AI Coach'}</span>
            </button>

            {/* Piece Customizer Button */}
            <button
              onClick={onOpenCustomizer}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title={isAr ? 'تخصيص مظهر القطع والألوان' : 'Customize Pieces'}
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'تخصيص القطع' : 'Pieces'}</span>
            </button>

            {/* Saved Games / Progress Button */}
            <button
              onClick={onOpenSavedGames}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title={isAr ? 'حفظ التقدم والمباريات' : 'Saved Games'}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'سجل المباريات' : 'Saved'}</span>
            </button>

            {/* Language Switcher Button */}
            <button
              onClick={onToggleLang}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isAr ? 'English (EN)' : 'العربية (AR)'}</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              onClick={onToggleSound}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'الصوت: مفعل' : 'Sound: ON'}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{isAr ? 'الصوت: مكتوم' : 'Sound: OFF'}</span>
                </>
              )}
            </button>

            {/* Hide Interface Button [H] */}
            <button
              onClick={onToggleUiHidden}
              className="px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400/50 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              title="إخفاء الواجهة لرؤية ثلاثية الأبعاد كاملة"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{isAr ? 'إخفاء الواجهة [H]' : 'Hide UI [H]'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM CONTROL & STATS STRIP (Matching screenshots 1, 2, 3, 4) */}
      <div className="w-full p-2.5 md:p-3 pointer-events-auto">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] md:text-xs">
          {/* Bottom Left: Controls Navigation Hint (Exact match to screenshot) */}
          <div className="px-4 py-2 rounded-full bg-black/80 border border-neutral-800 text-neutral-400 flex items-center gap-2 shadow-md">
            <span className="font-bold text-amber-400">{isAr ? 'التحكم:' : 'Controls:'}</span>
            <span>
              {isAr
                ? 'انقر على القطعة لتحريكها • سحب يسار: دوران • سحب يمين: تحريك • عجلة الماوس: تقريب • H: إخفاء الواجهة'
                : 'Click piece to move • Left-drag: Orbit • Right-drag: Pan • Scroll: Zoom • H: Hide UI'}
            </span>
          </div>

          {/* Bottom Right: Match Statistics Strip (Exact match to screenshot) */}
          <div className="px-4 py-2 rounded-full bg-black/85 border border-amber-500/30 text-neutral-300 flex items-center gap-3 font-mono shadow-md">
            <div className="flex items-center gap-1 text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{isAr ? 'الوقت:' : 'Time:'}</span>
              <span className="font-bold">{formatTime(currentTurn === 'w' ? whiteTime : blackTime)}</span>
            </div>
            <span>•</span>
            <div>
              <span>{isAr ? 'الحركات:' : 'Moves:'}</span>{' '}
              <span className="font-bold text-white">{movesHistory.length}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>♔</span>
              <span>{isAr ? 'أسر الأبيض:' : 'White Captured:'}</span>{' '}
              <span className="font-bold text-white">{capturedByWhite.length}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>♚</span>
              <span>{isAr ? 'أسر الأسود:' : 'Black Captured:'}</span>{' '}
              <span className="font-bold text-white">{capturedByBlack.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  PieceColor,
  PieceType,
  BoardThemeId,
  GameMode,
  AIDifficulty,
  ChessMoveRecord,
} from '../types/chess';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Palette,
  ChevronUp,
  ChevronDown,
  Home,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { CHESS_THEMES } from '../three/themes';

interface GameHUDProps {
  currentTurn: PieceColor;
  isCheck: boolean;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColor: PieceColor;
  capturedByWhite: PieceType[];
  capturedByBlack: PieceType[];
  whiteTime: number; // seconds
  blackTime: number; // seconds
  movesHistory: ChessMoveRecord[];
  themeId: BoardThemeId;
  soundEnabled: boolean;
  onSetTheme: (id: BoardThemeId) => void;
  onToggleSound: () => void;
  onUndoMove: () => void;
  onOpenAdvisor: () => void;
  onRestartGame: () => void;
  onReturnToMenu: () => void;
  onCameraChange: (preset: 'white' | 'black' | 'top' | 'cinematic') => void;
  isAiThinking: boolean;
}

// Convert piece type to Unicode chess symbol for captured tray
const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const GameHUD: React.FC<GameHUDProps> = ({
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
  themeId,
  soundEnabled,
  onSetTheme,
  onToggleSound,
  onUndoMove,
  onOpenAdvisor,
  onRestartGame,
  onReturnToMenu,
  onCameraChange,
  isAiThinking,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'theme' | 'actions'>('actions');

  // Compute material differences
  const whiteMaterialScore = capturedByWhite.reduce((acc, p) => acc + (PIECE_VALUES[p] || 0), 0);
  const blackMaterialScore = capturedByBlack.reduce((acc, p) => acc + (PIECE_VALUES[p] || 0), 0);
  const scoreDiff = whiteMaterialScore - blackMaterialScore;

  const whiteDiffStr = scoreDiff > 0 ? `+${scoreDiff}` : '';
  const blackDiffStr = scoreDiff < 0 ? `+${Math.abs(scoreDiff)}` : '';

  const whitePlayerName =
    gameMode === 'vs-ai'
      ? playerColor === 'w'
        ? 'أنت (الأبيض)'
        : `الذكاء (${aiDifficulty})`
      : 'اللاعب الأبيض';

  const blackPlayerName =
    gameMode === 'vs-ai'
      ? playerColor === 'b'
        ? 'أنت (الأسود)'
        : `الذكاء (${aiDifficulty})`
      : 'اللاعب الأسود';

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none text-white font-['Cairo',sans-serif]" dir="rtl">
      {/* 1. TOP PERIMETER STATUS CLUSTERS */}
      <div className="p-3 md:p-4 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* White Player Status */}
        <div
          className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
            currentTurn === 'w'
              ? 'bg-neutral-900/95 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
              : 'bg-neutral-900/80 border-neutral-800 opacity-80'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-950 flex items-center justify-center font-bold text-lg shadow">
            ♔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-200">{whitePlayerName}</span>
              {whiteDiffStr && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  {whiteDiffStr}
                </span>
              )}
            </div>
            {/* Captured Pieces by White */}
            <div className="flex items-center gap-0.5 text-xs text-neutral-400 h-4">
              {capturedByWhite.map((p, i) => (
                <span key={i} title={p} className="text-neutral-300">
                  {PIECE_SYMBOLS[p].black}
                </span>
              ))}
            </div>
          </div>
          <div className="mr-3 flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums text-neutral-300 bg-neutral-800/80 px-2 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatTime(whiteTime)}</span>
          </div>
        </div>

        {/* Center Alert / Turn Badge & Notation */}
        <div className="pointer-events-auto flex flex-col items-center gap-1">
          {isCheck && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-bounce">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>كش ملك! (Check)</span>
            </div>
          )}

          {isAiThinking && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>الذكاء الاصطناعي يفكر في النقلة...</span>
            </div>
          )}

          {/* Last Moves Ribbon */}
          {movesHistory.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-neutral-900/85 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
              <span className="text-neutral-500 font-sans">النقلات:</span>
              {movesHistory.slice(-4).map((m, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded ${
                    idx === movesHistory.slice(-4).length - 1
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-neutral-300'
                  }`}
                >
                  {m.san}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Black Player Status */}
        <div
          className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
            currentTurn === 'b'
              ? 'bg-neutral-900/95 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
              : 'bg-neutral-900/80 border-neutral-800 opacity-80'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white border border-neutral-700 flex items-center justify-center font-bold text-lg shadow">
            ♚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-200">{blackPlayerName}</span>
              {blackDiffStr && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  {blackDiffStr}
                </span>
              )}
            </div>
            {/* Captured Pieces by Black */}
            <div className="flex items-center gap-0.5 text-xs text-neutral-400 h-4">
              {capturedByBlack.map((p, i) => (
                <span key={i} title={p} className="text-neutral-300">
                  {PIECE_SYMBOLS[p].white}
                </span>
              ))}
            </div>
          </div>
          <div className="mr-3 flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums text-neutral-300 bg-neutral-800/80 px-2 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatTime(blackTime)}</span>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED BOTTOM CONTROL DOCK (Three.js Skill Compliant) */}
      <div className="fixed bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 w-full max-w-[min(940px,94vw)] z-30 pointer-events-auto flex flex-col items-center">
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 px-4 py-1 rounded-t-lg bg-neutral-900/95 border-t border-x border-neutral-700/80 text-[11px] font-semibold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-all shadow"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isDockCollapsed ? 'إظهار لوحة التحكم' : 'إخفاء لوحة التحكم'}</span>
        </button>

        {/* Dock Container */}
        {!isDockCollapsed && (
          <div className="w-full bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-2.5 md:p-3 shadow-2xl flex flex-col gap-2">
            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'actions'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  التحكم باللعبة
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'camera'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>الكاميرا</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('theme')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'theme'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>المظهر (Themes)</span>
                </button>
              </div>

              {/* Quick Sound Toggle & Menu */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleSound}
                  className="p-1.5 rounded-lg bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all"
                  title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
                </button>
                <button
                  type="button"
                  onClick={onReturnToMenu}
                  className="p-1.5 rounded-lg bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all"
                  title="العودة للقائمة الرئيسية"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            {activeTab === 'actions' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {/* AI Advisor Button */}
                  <button
                    type="button"
                    onClick={onOpenAdvisor}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 hover:border-amber-400 hover:text-amber-200 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>تحليل الموقف (Gemini AI)</span>
                  </button>

                  {/* Undo Button */}
                  <button
                    type="button"
                    onClick={onUndoMove}
                    disabled={movesHistory.length === 0}
                    className="px-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تراجع</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Restart Game */}
                  <button
                    type="button"
                    onClick={onRestartGame}
                    className="px-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-red-400 hover:bg-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة اللعبة</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onCameraChange('white')}
                  className="py-2 px-2 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:border-amber-400/50 text-xs font-bold text-neutral-300 hover:text-white transition-all text-center"
                >
                  زاوية الأبيض
                </button>
                <button
                  type="button"
                  onClick={() => onCameraChange('black')}
                  className="py-2 px-2 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:border-amber-400/50 text-xs font-bold text-neutral-300 hover:text-white transition-all text-center"
                >
                  زاوية الأسود
                </button>
                <button
                  type="button"
                  onClick={() => onCameraChange('top')}
                  className="py-2 px-2 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:border-amber-400/50 text-xs font-bold text-neutral-300 hover:text-white transition-all text-center"
                >
                  رؤية علوية تكتيكية
                </button>
                <button
                  type="button"
                  onClick={() => onCameraChange('cinematic')}
                  className="py-2 px-2 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:border-amber-400/50 text-xs font-bold text-neutral-300 hover:text-white transition-all text-center"
                >
                  دوران سينمائي
                </button>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {Object.values(CHESS_THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onSetTheme(theme.id)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-center truncate ${
                      themeId === theme.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {theme.nameArabic}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

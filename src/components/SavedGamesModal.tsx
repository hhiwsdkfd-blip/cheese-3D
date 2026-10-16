import React, { useState, useEffect } from 'react';
import { SavedGame } from '../types/chess';
import { getSavedGames, deleteSavedGame, saveGame } from '../storage/gameStorage';
import {
  Bookmark,
  X,
  Play,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle,
  Clock,
  History,
} from 'lucide-react';

interface SavedGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeGame: (game: SavedGame) => void;
  onReplayGame: (game: SavedGame) => void;
  onSaveCurrentGame: (title: string) => void;
  canSaveCurrent: boolean;
}

export const SavedGamesModal: React.FC<SavedGamesModalProps> = ({
  isOpen,
  onClose,
  onResumeGame,
  onReplayGame,
  onSaveCurrentGame,
  canSaveCurrent,
}) => {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  const refreshList = () => {
    setGames(getSavedGames());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || `مباراة ${new Date().toLocaleTimeString('ar-EG')}`;
    onSaveCurrentGame(title);
    setNewTitle('');
    setTimeout(refreshList, 100);
  };

  const handleDelete = (id: string) => {
    deleteSavedGame(id);
    refreshList();
  };

  const filteredGames = games.filter((g) => {
    if (activeTab === 'in-progress') return !g.isCompleted;
    if (activeTab === 'completed') return g.isCompleted;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="w-full max-w-xl bg-neutral-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Bookmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black">سجل المباريات وحفظ التقدم</h3>
              <p className="text-[11px] text-neutral-400">احفظ مبارياتك، استأنفها لاحقاً، أو أعد تشغيلها للتحليل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Game Form */}
        {canSaveCurrent && (
          <form onSubmit={handleSave} className="p-3 my-3 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="اسم للمباراة الحالية (مثال: افتتاح دفاع صقلية)..."
              className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ الحالية</span>
            </button>
          </form>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 my-1 border-b border-neutral-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            الكل ({games.length})
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'in-progress'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            قيد التقدم ({games.filter((g) => !g.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            مكتملة ({games.filter((g) => g.isCompleted).length})
          </button>
        </div>

        {/* Games List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2.5">
          {filteredGames.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              لا توجد مباريات محفوظة بعد في هذا القسم.
            </div>
          ) : (
            filteredGames.map((game) => (
              <div
                key={game.id}
                className="p-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/80 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-300">{game.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                        game.isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {game.isCompleted ? 'مكتملة' : 'قيد اللعب'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {game.date}
                    </span>
                    <span>•</span>
                    <span>النقلات: {game.moves.length}</span>
                    <span>•</span>
                    <span>النمط: {game.gameMode === 'vs-ai' ? 'ضد الكمبيوتر' : 'لاعبان'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center">
                  {!game.isCompleted && (
                    <button
                      onClick={() => {
                        onResumeGame(game);
                        onClose();
                      }}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                      title="استئناف اللعب"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استئناف</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onReplayGame(game);
                      onClose();
                    }}
                    className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-all"
                    title="إعادة تشغيل وتحليل المباراة"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>إعادة تشغيل وتحليل</span>
                  </button>

                  <button
                    onClick={() => handleDelete(game.id)}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500/40 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

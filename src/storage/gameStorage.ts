import { SavedGame } from '../types/chess';

const STORAGE_KEY = 'grandmaster_3d_saved_games';

export function getSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved games:', e);
    return [];
  }
}

export function saveGame(game: SavedGame): void {
  try {
    const games = getSavedGames();
    const existingIndex = games.findIndex((g) => g.id === game.id);
    if (existingIndex >= 0) {
      games[existingIndex] = game;
    } else {
      games.unshift(game);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function deleteSavedGame(id: string): void {
  try {
    const games = getSavedGames().filter((g) => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.error('Failed to delete saved game:', e);
  }
}

export function getSavedGameById(id: string): SavedGame | null {
  const games = getSavedGames();
  return games.find((g) => g.id === id) || null;
}

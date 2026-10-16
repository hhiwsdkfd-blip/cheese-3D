export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export type GameMode = 'vs-ai' | 'pass-and-play' | 'ai-vs-ai';
export type AIDifficulty = 'novice' | 'intermediate' | 'master';

export type BoardThemeId = 'royal-marble' | 'cathedral-runic' | 'walnut-maple' | 'marble-obsidian' | 'gold-titanium';
export type PieceStyleId = 'royal' | 'classic' | 'modern' | 'fantasy' | 'wizard';

export interface PieceCustomization {
  style: PieceStyleId;
  whiteColor: string;
  blackColor: string;
  accentColor: string;
  metalness: number;
  roughness: number;
}

export interface BoardTheme {
  id: BoardThemeId;
  nameArabic: string;
  nameEnglish: string;
  lightSquareColor: string;
  darkSquareColor: string;
  borderWoodColor: string;
  whitePieceColor: string;
  blackPieceColor: string;
  whitePieceMetalness: number;
  whitePieceRoughness: number;
  blackPieceMetalness: number;
  blackPieceRoughness: number;
  goldAccentColor: string;
  accentMetalness: number;
  accentRoughness: number;
  environmentBg: string;
  lightFeltColor: string;
  darkFeltColor: string;
}

export interface ChessMoveRecord {
  from: string;
  to: string;
  piece: PieceType;
  color: PieceColor;
  san: string;
  captured?: PieceType;
  timestamp: number;
  isCheck?: boolean;
}

export interface ChessAnalysisResult {
  evaluation: string;
  suggestedMove: string;
  bestMoveCommentary: string;
  strategyExplanation: string;
  commonMistakes: string[];
  tacticalThreats: string[];
  strategicPlan: string;
}

export interface Piece3DInfo {
  id: string;
  type: PieceType;
  color: PieceColor;
  square: string;
}

export interface SavedGame {
  id: string;
  title: string;
  date: string;
  fen: string;
  moves: string[]; // SAN notation list
  gameMode: GameMode;
  difficulty: AIDifficulty;
  playerColor: PieceColor;
  whiteTime: number;
  blackTime: number;
  isCompleted: boolean;
  winner?: PieceColor | 'draw' | null;
  reason?: string;
  pieceStyle: PieceStyleId;
  whiteColor: string;
  blackColor: string;
}

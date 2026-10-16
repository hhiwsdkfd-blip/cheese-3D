import { Chess, Move, Square, PieceSymbol } from 'chess.js';
import { AIDifficulty } from '../types/chess';

// Standard Piece Values (centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional Piece-Square Tables (from White's perspective; flipped for Black)
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_PST_MIDGAME = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: Square, color: 'w' | 'b'): number {
  const file = square.charCodeAt(0) - 97; // 0-7
  const rank = parseInt(square[1], 10) - 1; // 0-7
  if (color === 'w') {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      const sq = (String.fromCharCode(97 + f) + (8 - r)) as Square;
      const pieceVal = PIECE_VALUES[piece.type];
      let pstVal = 0;
      const sqIdx = getSquareIndex(sq, piece.color);

      switch (piece.type) {
        case 'p':
          pstVal = PAWN_PST[sqIdx];
          break;
        case 'n':
          pstVal = KNIGHT_PST[sqIdx];
          break;
        case 'b':
          pstVal = BISHOP_PST[sqIdx];
          break;
        case 'r':
          pstVal = ROOK_PST[sqIdx];
          break;
        case 'q':
          pstVal = QUEEN_PST[sqIdx];
          break;
        case 'k':
          pstVal = KING_PST_MIDGAME[sqIdx];
          break;
      }

      const totalVal = pieceVal + pstVal;
      if (piece.color === 'w') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  return score;
}

// Move ordering to improve Alpha-Beta pruning
function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100);
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100);
    }
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;

    return scoreB - scoreA;
  });
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return isMaximizing ? -50000 + depth : 50000 - depth;
    }
    if (chess.isDraw()) return 0;
    return evaluateBoard(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Calculates the best move for current board position
 */
export async function calculateBestMove(
  chess: Chess,
  difficulty: AIDifficulty
): Promise<Move | null> {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Small delay for natural human-like pacing
  await new Promise((resolve) => setTimeout(resolve, 250));

  const isWhite = chess.turn() === 'w';

  // Novice level: occasionally chooses suboptimal moves or random legal move
  if (difficulty === 'novice') {
    if (Math.random() < 0.35) {
      // Pick random safe move
      return moves[Math.floor(Math.random() * moves.length)];
    }
    // Simple 1-ply search
    const depth = 1;
    let bestMove = moves[0];
    let bestVal = isWhite ? -Infinity : Infinity;

    for (const move of orderMoves(moves)) {
      chess.move(move);
      const val = evaluateBoard(chess);
      chess.undo();

      if (isWhite && val > bestVal) {
        bestVal = val;
        bestMove = move;
      } else if (!isWhite && val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Intermediate: 2-3 ply depth search
  const depth = difficulty === 'intermediate' ? 2 : 3;
  let bestMove = moves[0];
  let bestVal = isWhite ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  const ordered = orderMoves(moves);
  for (const move of ordered) {
    chess.move(move);
    const score = minimax(chess, depth - 1, alpha, beta, !isWhite);
    chess.undo();

    if (isWhite) {
      if (score > bestVal) {
        bestVal = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestVal) {
        bestVal = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
    }
  }

  return bestMove;
}

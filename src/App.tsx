import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import {
  GameMode,
  AIDifficulty,
  PieceColor,
  PieceType,
  BoardThemeId,
  PieceStyleId,
  ChessMoveRecord,
  SavedGame,
} from './types/chess';
import { CHESS_THEMES } from './three/themes';
import { ChessScene, CameraPreset } from './three/chessScene';
import { CathedralHUD } from './components/CathedralHUD';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { PieceCustomizerModal } from './components/PieceCustomizerModal';
import { SavedGamesModal } from './components/SavedGamesModal';
import { ReplayControls } from './components/ReplayControls';
import { PromotionModal } from './components/PromotionModal';
import { GameOverModal } from './components/GameOverModal';
import { soundManager } from './audio/soundEffects';
import { calculateBestMove } from './engine/aiEngine';
import { saveGame } from './storage/gameStorage';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const chessRef = useRef<Chess>(new Chess());
  const sceneRef = useRef<ChessScene | null>(null);

  // App & Language state
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isUiHidden, setIsUiHidden] = useState<boolean>(false);
  const [activeCamera, setActiveCamera] = useState<CameraPreset>('player');

  // Game Mode & Settings
  const [gameMode, setMode] = useState<GameMode>('vs-ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('intermediate');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [themeId, setThemeId] = useState<BoardThemeId>('royal-marble');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Piece Customization
  const [pieceStyle, setPieceStyle] = useState<PieceStyleId>('royal');
  const [whitePieceColor, setWhitePieceColor] = useState<string>('#faf6ee');
  const [blackPieceColor, setBlackPieceColor] = useState<string>('#121418');

  // Play State
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('w');
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [movesHistory, setMovesHistory] = useState<ChessMoveRecord[]>([]);
  const [capturedByWhite, setCapturedByWhite] = useState<PieceType[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceType[]>([]);

  // Timers (in seconds)
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);

  // Modals state
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isSavedGamesOpen, setIsSavedGamesOpen] = useState<boolean>(false);

  // Replay Mode State
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayMoves, setReplayMoves] = useState<string[]>([]);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Promotion & Game Over
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
    color: PieceColor;
  } | null>(null);

  const [gameOverInfo, setGameOverInfo] = useState<{
    winner: PieceColor | 'draw' | null;
    reason: 'checkmate' | 'stalemate' | 'draw' | 'threefold' | 'insufficient';
  } | null>(null);

  // Sync sound manager
  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  // Keyboard shortcut listener for 'H' to hide/show UI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
        setIsUiHidden((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Timer clock effect
  useEffect(() => {
    if (isReplaying || gameOverInfo) return;

    const timer = setInterval(() => {
      if (currentTurn === 'w') {
        setWhiteTime((prev) => Math.max(prev - 1, 0));
      } else {
        setBlackTime((prev) => Math.max(prev - 1, 0));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isReplaying, currentTurn, gameOverInfo]);

  // Check Game Over
  const checkGameEnd = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'b' : 'w';
      setGameOverInfo({ winner, reason: 'checkmate' });

      // Automatically save completed game to history
      saveGame({
        id: `match_${Date.now()}`,
        title: `مباراة كش مات (${winner === 'w' ? 'فوز الأبيض' : 'فوز الأسود'})`,
        date: new Date().toLocaleDateString('ar-EG'),
        fen: chess.fen(),
        moves: chess.history(),
        gameMode,
        difficulty,
        playerColor,
        whiteTime,
        blackTime,
        isCompleted: true,
        winner,
        reason: 'checkmate',
        pieceStyle,
        whiteColor: whitePieceColor,
        blackColor: blackPieceColor,
      });

      return true;
    } else if (chess.isStalemate()) {
      setGameOverInfo({ winner: 'draw', reason: 'stalemate' });
      return true;
    } else if (chess.isDraw()) {
      setGameOverInfo({ winner: 'draw', reason: 'draw' });
      return true;
    }
    return false;
  }, [gameMode, difficulty, playerColor, whiteTime, blackTime, pieceStyle, whitePieceColor, blackPieceColor]);

  // Update check indicators on king
  const updateCheckState = useCallback(() => {
    const chess = chessRef.current;
    const inCheck = chess.inCheck();
    setIsCheck(inCheck);

    if (inCheck && sceneRef.current) {
      const turn = chess.turn();
      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const p = board[r][f];
          if (p && p.type === 'k' && p.color === turn) {
            const sq = String.fromCharCode(97 + f) + (8 - r);
            sceneRef.current.setCheckSquare(sq);
            soundManager.playCheck();
            return;
          }
        }
      }
    } else if (sceneRef.current) {
      sceneRef.current.setCheckSquare(null);
    }
  }, []);

  // Execute Move
  const executeMove = useCallback(
    (from: string, to: string, promotionPiece?: PieceType) => {
      const chess = chessRef.current;
      const scene = sceneRef.current;
      if (!scene) return;

      const pieceOnTarget = chess.get(to as Square);
      const isCapture = !!pieceOnTarget;

      try {
        const move = chess.move({
          from: from as Square,
          to: to as Square,
          promotion: promotionPiece || 'q',
        });

        if (!move) {
          soundManager.playInvalid();
          return;
        }

        // 3D Parabolic Animation
        scene.animateMove(from, to, isCapture, () => {
          scene.syncPieces(chess.board());
        });

        scene.setLastMove(from, to);
        scene.setSuggestedMove(null, null); // Clear AI suggestion highlight once moved

        // Track captures
        if (move.captured) {
          if (move.color === 'w') {
            setCapturedByWhite((prev) => [...prev, move.captured as PieceType]);
          } else {
            setCapturedByBlack((prev) => [...prev, move.captured as PieceType]);
          }
        }

        const record: ChessMoveRecord = {
          from: move.from,
          to: move.to,
          piece: move.piece as PieceType,
          color: move.color as PieceColor,
          san: move.san,
          captured: move.captured as PieceType | undefined,
          timestamp: Date.now(),
        };
        setMovesHistory((prev) => [...prev, record]);

        const nextTurn = chess.turn() as PieceColor;
        setCurrentTurn(nextTurn);

        updateCheckState();
        checkGameEnd();
      } catch (err) {
        soundManager.playInvalid();
      }
    },
    [checkGameEnd, updateCheckState]
  );

  // Trigger AI Move
  const handleTriggerAiMove = useCallback(async () => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;

    setIsAiThinking(true);
    const bestMove = await calculateBestMove(chess, difficulty);
    setIsAiThinking(false);

    if (bestMove) {
      executeMove(bestMove.from, bestMove.to, bestMove.promotion as PieceType | undefined);
    }
  }, [difficulty, executeMove]);

  // Handle Square Selection in 3D
  const handleSquareSelect = useCallback(
    (square: string) => {
      if (isReplaying || isAiThinking) return;
      const chess = chessRef.current;
      const scene = sceneRef.current;
      if (!scene) return;

      const piece = chess.get(square as Square);
      const currentTurnColor = chess.turn();

      if (gameMode === 'vs-ai' && currentTurnColor !== playerColor) {
        return;
      }

      if (piece && piece.color === currentTurnColor) {
        const moves = chess.moves({ square: square as Square, verbose: true });
        const validTargets = moves.map((m) => m.to);
        scene.setSelectedSquare(square, validTargets);
      } else {
        scene.clearSelection();
      }
    },
    [isReplaying, isAiThinking, gameMode, playerColor]
  );

  // Handle Piece Move request from 3D scene
  const handlePieceMove = useCallback(
    (from: string, to: string) => {
      if (isReplaying || isAiThinking) return;
      const chess = chessRef.current;
      const piece = chess.get(from as Square);

      if (!piece) return;

      const isPawn = piece.type === 'p';
      const isWhitePromoting = piece.color === 'w' && from[1] === '7' && to[1] === '8';
      const isBlackPromoting = piece.color === 'b' && from[1] === '2' && to[1] === '1';

      if (isPawn && (isWhitePromoting || isBlackPromoting)) {
        setPendingPromotion({ from, to, color: piece.color });
        return;
      }

      executeMove(from, to);
    },
    [isReplaying, isAiThinking, executeMove]
  );

  // Automatic AI move response in vs-AI mode
  useEffect(() => {
    if (isReplaying || gameOverInfo || isAiThinking) return;

    const chess = chessRef.current;
    const currentTurnColor = chess.turn();

    if (gameMode === 'vs-ai' && currentTurnColor !== playerColor) {
      const timeout = setTimeout(() => {
        handleTriggerAiMove();
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [isReplaying, currentTurn, gameMode, playerColor, gameOverInfo, isAiThinking, handleTriggerAiMove]);

  // Reset / New Game
  const handleNewGame = () => {
    const chess = new Chess();
    chessRef.current = chess;

    setMovesHistory([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setWhiteTime(600);
    setBlackTime(600);
    setGameOverInfo(null);
    setCurrentTurn('w');
    setIsCheck(false);
    setIsReplaying(false);

    if (sceneRef.current) {
      sceneRef.current.syncPieces(chess.board());
      sceneRef.current.clearSelection();
      sceneRef.current.setLastMove(null, null);
      sceneRef.current.setCheckSquare(null);
      sceneRef.current.setSuggestedMove(null, null);
    }

    soundManager.playMove();
  };

  // Toggle Mode (Player vs AI / 2 Players)
  const handleToggleMode = () => {
    setMode((prev) => (prev === 'vs-ai' ? 'pass-and-play' : 'vs-ai'));
  };

  // Toggle Player Color Side (White / Black)
  const handleTogglePlayerColor = () => {
    const nextColor = playerColor === 'w' ? 'b' : 'w';
    setPlayerColor(nextColor);
    if (sceneRef.current) {
      sceneRef.current.playerPerspective = nextColor;
      sceneRef.current.setCameraPreset('player');
    }
  };

  // Camera preset change
  const handleCameraChange = (preset: CameraPreset) => {
    setActiveCamera(preset);
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(preset);
    }
  };

  // Highlight Move on 3D board from AI Assistant
  const handleHighlightAssistantMove = (moveSan: string) => {
    const chess = chessRef.current;
    const moves = chess.moves({ verbose: true });
    const targetMove = moves.find((m) => m.san === moveSan);
    if (targetMove && sceneRef.current) {
      sceneRef.current.setSuggestedMove(targetMove.from, targetMove.to);
    }
  };

  // Undo Move
  const handleUndoMove = () => {
    const chess = chessRef.current;
    const scene = sceneRef.current;
    if (!scene || movesHistory.length === 0 || isAiThinking || isReplaying) return;

    const movesToUndo = gameMode === 'vs-ai' && movesHistory.length >= 2 ? 2 : 1;
    for (let i = 0; i < movesToUndo; i++) {
      chess.undo();
    }

    setMovesHistory((prev) => prev.slice(0, prev.length - movesToUndo));
    setCurrentTurn(chess.turn());

    // Refresh captured counts
    const currentPieces = chess.board().flat().filter(Boolean);
    const initialPieceCounts: Record<PieceColor, Record<PieceType, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };
    const remainingCounts: Record<PieceColor, Record<PieceType, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };
    currentPieces.forEach((p) => {
      if (p) remainingCounts[p.color][p.type]++;
    });

    const capByW: PieceType[] = [];
    const capByB: PieceType[] = [];
    (['p', 'n', 'b', 'r', 'q'] as PieceType[]).forEach((type) => {
      const missingBlack = initialPieceCounts.b[type] - remainingCounts.b[type];
      for (let i = 0; i < missingBlack; i++) capByW.push(type);
      const missingWhite = initialPieceCounts.w[type] - remainingCounts.w[type];
      for (let i = 0; i < missingWhite; i++) capByB.push(type);
    });

    setCapturedByWhite(capByW);
    setCapturedByBlack(capByB);

    scene.clearSelection();
    scene.syncPieces(chess.board());
    scene.setLastMove(null, null);
    scene.setSuggestedMove(null, null);
    updateCheckState();
  };

  // Apply piece customizer settings
  const handleApplyCustomization = (
    newStyle: PieceStyleId,
    newWhiteColor: string,
    newBlackColor: string
  ) => {
    setPieceStyle(newStyle);
    setWhitePieceColor(newWhiteColor);
    setBlackPieceColor(newBlackColor);

    if (sceneRef.current) {
      sceneRef.current.setPieceCustomization(newWhiteColor, newBlackColor, newStyle);
      sceneRef.current.syncPieces(chessRef.current.board());
    }
  };

  // Save in-progress game
  const handleSaveCurrentGame = (title: string) => {
    const chess = chessRef.current;
    const gameToSave: SavedGame = {
      id: `game_${Date.now()}`,
      title,
      date: new Date().toLocaleDateString('ar-EG'),
      fen: chess.fen(),
      moves: chess.history(),
      gameMode,
      difficulty,
      playerColor,
      whiteTime,
      blackTime,
      isCompleted: false,
      pieceStyle,
      whiteColor: whitePieceColor,
      blackColor: blackPieceColor,
    };
    saveGame(gameToSave);
  };

  // Resume a saved game
  const handleResumeSavedGame = (game: SavedGame) => {
    const chess = new Chess();
    try {
      chess.load(game.fen);
      chessRef.current = chess;

      setMode(game.gameMode);
      setDifficulty(game.difficulty);
      setPlayerColor(game.playerColor);
      setWhiteTime(game.whiteTime || 600);
      setBlackTime(game.blackTime || 600);
      setCurrentTurn(chess.turn());
      setIsReplaying(false);
      setGameOverInfo(null);

      // Reconstruct moves
      const moves = game.moves || [];
      const historyRecords: ChessMoveRecord[] = moves.map((san) => ({
        from: '',
        to: '',
        piece: 'p',
        color: 'w',
        san,
        timestamp: Date.now(),
      }));
      setMovesHistory(historyRecords);

      // Apply saved piece customizer colors if present
      if (game.pieceStyle) {
        setPieceStyle(game.pieceStyle);
        setWhitePieceColor(game.whiteColor || '#f8fafc');
        setBlackPieceColor(game.blackColor || '#181a20');
        sceneRef.current?.setPieceCustomization(game.whiteColor, game.blackColor, game.pieceStyle);
      }

      sceneRef.current?.syncPieces(chess.board());
      sceneRef.current?.clearSelection();
      sceneRef.current?.setLastMove(null, null);
      updateCheckState();
    } catch (e) {
      console.error('Failed to resume game:', e);
    }
  };

  // Start Replaying a saved match
  const handleStartReplay = (game: SavedGame) => {
    setIsReplaying(true);
    setReplayMoves(game.moves || []);
    setReplayIndex(0);
    setIsAutoPlaying(false);

    // Reset board to initial position
    const chess = new Chess();
    chessRef.current = chess;
    sceneRef.current?.syncPieces(chess.board());
    sceneRef.current?.clearSelection();
    sceneRef.current?.setLastMove(null, null);
    setCurrentTurn('w');
  };

  // Step to specific move index in replay
  const goToReplayIndex = (targetIndex: number) => {
    const clamped = Math.max(0, Math.min(targetIndex, replayMoves.length));
    const chess = new Chess();
    for (let i = 0; i < clamped; i++) {
      chess.move(replayMoves[i]);
    }
    chessRef.current = chess;
    setReplayIndex(clamped);
    setCurrentTurn(chess.turn());

    if (sceneRef.current) {
      sceneRef.current.syncPieces(chess.board());
      const history = chess.history({ verbose: true });
      if (history.length > 0) {
        const last = history[history.length - 1];
        sceneRef.current.setLastMove(last.from, last.to);
      } else {
        sceneRef.current.setLastMove(null, null);
      }
    }
  };

  // Auto-play replay timer
  useEffect(() => {
    if (!isReplaying || !isAutoPlaying) return;

    if (replayIndex >= replayMoves.length) {
      setIsAutoPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      goToReplayIndex(replayIndex + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, [isReplaying, isAutoPlaying, replayIndex, replayMoves]);

  // Mount 3D Scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new ChessScene(mountRef.current, CHESS_THEMES[themeId], {
      onSquareSelect: (square) => handleSquareSelect(square),
      onPieceMove: (from, to) => handlePieceMove(from, to),
    });

    sceneRef.current = scene;
    scene.syncPieces(chessRef.current.board());
    scene.setCameraPreset('player');

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-['Cairo',sans-serif]">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Cathedral Main HUD Strip (Matching screenshots 1, 2, 3, 4) */}
      {!isReplaying && (
        <CathedralHUD
          currentTurn={currentTurn}
          isCheck={isCheck}
          gameMode={gameMode}
          aiDifficulty={difficulty}
          playerColor={playerColor}
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
          whiteTime={whiteTime}
          blackTime={blackTime}
          movesHistory={movesHistory}
          soundEnabled={soundEnabled}
          isUiHidden={isUiHidden}
          activeCamera={activeCamera}
          lang={lang}
          onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onToggleUiHidden={() => setIsUiHidden((prev) => !prev)}
          onCameraChange={handleCameraChange}
          onToggleMode={handleToggleMode}
          onTogglePlayerColor={handleTogglePlayerColor}
          onTriggerAiMove={handleTriggerAiMove}
          onNewGame={handleNewGame}
          onUndoMove={handleUndoMove}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onOpenSavedGames={() => setIsSavedGamesOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          isAiThinking={isAiThinking}
        />
      )}

      {/* Match Replay Controls Bar */}
      {isReplaying && (
        <ReplayControls
          currentMoveIndex={replayIndex}
          totalMoves={replayMoves.length}
          isPlaying={isAutoPlaying}
          onTogglePlay={() => setIsAutoPlaying((prev) => !prev)}
          onFirst={() => goToReplayIndex(0)}
          onPrev={() => goToReplayIndex(replayIndex - 1)}
          onNext={() => goToReplayIndex(replayIndex + 1)}
          onLast={() => goToReplayIndex(replayMoves.length)}
          onOpenAdvisor={() => setIsAssistantOpen(true)}
          onExitReplay={() => {
            setIsReplaying(false);
            handleNewGame();
          }}
        />
      )}

      {/* AI Chess Assistant Drawer */}
      <AIAssistantDrawer
        fen={chessRef.current.fen()}
        history={movesHistory.map((m) => m.san)}
        currentTurn={currentTurn}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onHighlightMove={handleHighlightAssistantMove}
      />

      {/* Piece Customizer Modal (Styles & Colors) */}
      <PieceCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentStyle={pieceStyle}
        whiteColor={whitePieceColor}
        blackColor={blackPieceColor}
        onApplyCustomization={handleApplyCustomization}
      />

      {/* Saved Games / Progress Modal */}
      <SavedGamesModal
        isOpen={isSavedGamesOpen}
        onClose={() => setIsSavedGamesOpen(false)}
        onResumeGame={handleResumeSavedGame}
        onReplayGame={handleStartReplay}
        onSaveCurrentGame={handleSaveCurrentGame}
        canSaveCurrent={movesHistory.length > 0}
      />

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={pendingPromotion.color}
          onSelect={(piece) => {
            executeMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }}
        />
      )}

      {/* Game Over Celebration Modal */}
      {gameOverInfo && (
        <GameOverModal
          winner={gameOverInfo.winner}
          reason={gameOverInfo.reason}
          gameMode={gameMode}
          totalMoves={movesHistory.length}
          onRematch={handleNewGame}
          onReturnToMenu={handleNewGame}
        />
      )}
    </div>
  );
}

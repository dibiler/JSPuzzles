import { useEffect, useRef, useState, useCallback } from 'react';
import { usePuzzle } from '../../contexts/PuzzleContext';
import type { PuzzlePiece } from '../../types';
import { createObjectURL, revokeObjectURL } from '../../services/imageService';

interface Props {
  onBack: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

// The piece being dragged, tracked globally during a pointer event sequence
interface DragState {
  piece: PuzzlePiece;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function PuzzleGame({ onBack, dark, onToggleTheme }: Props) {
  const { session, placePiece, resetPuzzle, isComplete } = usePuzzle();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);
  const [blueprintSize, setBlueprintSize] = useState<{ w: number; h: number } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [rejectedPieceId, setRejectedPieceId] = useState<string | null>(null);
  const [lastDropPos, setLastDropPos] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'tray'>('tray');
  const blueprintRef = useRef<HTMLDivElement>(null);

  // Close completion overlay on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isComplete) {
        // Treat Escape as clicking "New puzzle"
        onBack();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isComplete, onBack]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (!session) return;
    const url = createObjectURL(session.image.blob);
    setImageUrl(url);
    // Derive natural dimensions from the loaded image (handles legacy stored images without width/height)
    const img = new Image();
    img.onload = () => setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => revokeObjectURL(url);
  }, [session?.image.blob]);

  // Track the Blueprint's rendered size so tray pieces match exact cell dimensions
  useEffect(() => {
    const el = blueprintRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0) setBlueprintSize({ w: width, h: height });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) setBlueprintSize({ w: rect.width, h: rect.height });
    return () => ro.disconnect();
  }, [imageUrl, imgDimensions]); // re-run when blueprint first renders

  const handlePiecePointerDown = useCallback(
    (e: React.PointerEvent, piece: PuzzlePiece) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragState({
        piece,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      });
      // On mobile, switch to blueprint tab so user can drop
      if (isMobile) setActiveTab('blueprint');
    },
    [isMobile],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      setDragState((d) => d && { ...d, currentX: e.clientX, currentY: e.clientY });
    },
    [dragState],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState || !blueprintRef.current || !session) {
        setDragState(null);
        return;
      }

      const rect = blueprintRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cellW = rect.width / session.grid.cols;
      const cellH = rect.height / session.grid.rows;
      const col = Math.floor(x / cellW);
      const row = Math.floor(y / cellH);

      let wasPlacedSuccessfully = false;
      if (row >= 0 && row < session.grid.rows && col >= 0 && col < session.grid.cols) {
        wasPlacedSuccessfully = placePiece(dragState.piece.id, row, col);
        // Store the drop position for rejection animation
        setLastDropPos({ x: e.clientX, y: e.clientY });
      }

      // If placement failed, show rejection animation
      if (!wasPlacedSuccessfully) {
        setRejectedPieceId(dragState.piece.id);
        setTimeout(() => {
          setRejectedPieceId(null);
          setLastDropPos(null);
        }, 500);
      } else {
        setLastDropPos(null);
      }

      setDragState(null);
    },
    [dragState, session, placePiece],
  );

  if (!session || !imageUrl || !imgDimensions) return null;

  const { grid, pieces, placedIds } = session;
  const imageWidth = imgDimensions.w;
  const imageHeight = imgDimensions.h;
  const cellW = blueprintSize ? blueprintSize.w / grid.cols : 80;
  const cellH = blueprintSize
    ? blueprintSize.h / grid.rows
    : Math.round(80 * (imageHeight / grid.rows) / (imageWidth / grid.cols));
  const trayWidth = Math.round(2 * cellW + 8 + 24); // 2 cols + gap-2 + p-3×2
  const unplacedPieces = pieces.filter((p) => !placedIds.has(p.id));
  const totalPieces = grid.rows * grid.cols;

  return (
    <div
      className="h-screen flex flex-col bg-brand-cream dark:bg-brand-purple text-brand-purple dark:text-brand-cream select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-brand-purple/15 dark:border-brand-cream/10 shrink-0">
        <button
          onClick={onBack}
          className="text-sm text-brand-purple/50 hover:text-brand-purple dark:text-brand-cream/50 dark:hover:text-brand-cream transition-colors"
          aria-label="Go back to puzzle selection"
          title="Go back (Escape in some contexts)"
        >
          ← Back
        </button>
        <div className="flex-1" />
        <div
          className="flex items-center gap-2 shrink-0"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Progress"
        >
          <span className="text-xs text-brand-purple/50 dark:text-brand-cream/50">
            {placedIds.size} / {totalPieces}
          </span>
          <div
            className="w-24 h-1.5 rounded-full bg-brand-purple/15 dark:bg-brand-cream/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={placedIds.size}
            aria-valuemin={0}
            aria-valuemax={totalPieces}
            aria-label={`Puzzle progress: ${placedIds.size} of ${totalPieces} pieces placed`}
          >
            <div
              className="h-full bg-brand-orange rounded-full transition-all"
              style={{ width: `${(placedIds.size / totalPieces) * 100}%` }}
            />
          </div>
        </div>
        <button
          onClick={resetPuzzle}
          className="text-xs text-brand-purple/50 hover:text-brand-purple dark:text-brand-cream/50 dark:hover:text-brand-cream transition-colors"
          aria-label="Shuffle pieces and clear board"
          title="Reset puzzle"
        >
          Reset
        </button>
        <button
          onClick={onToggleTheme}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="w-7 h-7 flex items-center justify-center rounded-full text-brand-purple/50 hover:text-brand-purple dark:text-brand-cream/50 dark:hover:text-brand-cream transition-colors"
          title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Mobile tab bar */}
      <div
        className="md:hidden flex border-b border-brand-purple/15 dark:border-brand-cream/10 shrink-0"
        role="tablist"
        aria-label="View mode"
      >
        {(['blueprint', 'tray'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-brand-orange text-brand-orange'
                : 'text-brand-purple/50 dark:text-brand-cream/50'
            }`}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            tabIndex={activeTab === tab ? 0 : -1}
          >
            {tab === 'blueprint' ? 'Blueprint' : 'Pieces'}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Blueprint column */}
        <article
          id="blueprint-panel"
          className={`${
            activeTab === 'blueprint' ? 'flex' : 'hidden'
          } md:flex flex-1 min-h-0 items-center justify-center p-4 overflow-hidden`}
          role="tabpanel"
          aria-labelledby="blueprint-tab"
        >
          <Blueprint
            ref={blueprintRef}
            imageUrl={imageUrl}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            grid={grid}
            placedIds={placedIds}
            pieces={pieces}
            dragState={dragState}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </article>

        {/* Divider */}
        <div className="hidden md:block w-px bg-brand-purple/15 dark:bg-brand-cream/10 shrink-0" aria-hidden="true" />

        {/* Piece Tray column */}
        <aside
          id="tray-panel"
          className={`piece-tray ${
            activeTab === 'tray' ? 'flex' : 'hidden'
          } md:flex w-full flex-col overflow-y-auto p-3 gap-2 shrink-0`}
          style={{ '--tray-width': `${trayWidth}px` } as React.CSSProperties}
          role="tabpanel"
          aria-labelledby="tray-tab"
          aria-label="Remaining puzzle pieces"
        >
          {unplacedPieces.length === 0 ? (
            <p className="text-brand-purple/40 dark:text-brand-cream/40 text-sm text-center pt-8">All pieces placed!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unplacedPieces.map((piece) => (
                <PieceTile
                  key={piece.id}
                  piece={piece}
                  imageUrl={imageUrl}
                  grid={grid}
                  cellW={cellW}
                  cellH={cellH}
                  isDragging={dragState?.piece.id === piece.id}
                  onPointerDown={handlePiecePointerDown}
                />
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Floating drag clone / rejection animation */}
      {(dragState || rejectedPieceId) && (
        <FloatingPiece
          piece={dragState?.piece || pieces.find((p) => p.id === rejectedPieceId)!}
          imageUrl={imageUrl}
          grid={grid}
          cellW={cellW}
          cellH={cellH}
          x={dragState?.currentX ?? lastDropPos?.x ?? 0}
          y={dragState?.currentY ?? lastDropPos?.y ?? 0}
          isRejected={!!rejectedPieceId}
        />
      )}

      {/* Completion overlay */}
      {isComplete && (
        <CompletionOverlay
          onPlayAgain={resetPuzzle}
          onNewPuzzle={onBack}
        />
      )}
    </div>
  );
}

// ─── Blueprint ───────────────────────────────────────────────────────────────

import { forwardRef } from 'react';

const Blueprint = forwardRef<
  HTMLDivElement,
  {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    grid: { rows: number; cols: number };
    placedIds: Set<string>;
    pieces: PuzzlePiece[];
    dragState: DragState | null;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  }
>(({ imageUrl, imageWidth, imageHeight, grid, placedIds, pieces, dragState, onPointerMove, onPointerUp }, ref) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  return (
    <div
      ref={ref}
      className="relative w-full max-w-2xl max-h-full"
      style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
      onPointerMove={(e) => {
        onPointerMove(e);
        if (!dragState) return;
        const rect = (ref as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor((x / rect.width) * grid.cols);
        const row = Math.floor((y / rect.height) * grid.rows);
        if (row >= 0 && row < grid.rows && col >= 0 && col < grid.cols) {
          setHoveredCell({ row, col });
        } else {
          setHoveredCell(null);
        }
      }}
      onPointerUp={(e) => {
        setHoveredCell(null);
        onPointerUp(e);
      }}
      onPointerLeave={() => setHoveredCell(null)}
    >
      {/* Ghost image */}
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-fill rounded-3xl"
        style={{ opacity: 0.25 }}
        draggable={false}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 grid rounded-3xl overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: grid.rows * grid.cols }).map((_, idx) => {
          const row = Math.floor(idx / grid.cols);
          const col = idx % grid.cols;
          const pieceId = `${row}-${col}`;
          const isPlaced = placedIds.has(pieceId);
          const isHovered = dragState && hoveredCell?.row === row && hoveredCell?.col === col;
          const placedPiece = isPlaced ? pieces.find((p) => p.id === pieceId) : null;

          return (
            <div
              key={pieceId}
              className={`border border-white/20 transition-colors ${
                isHovered ? 'bg-brand-teal/40' : ''
              }`}
            >
              {isPlaced && placedPiece && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
                    backgroundPosition: `${(col / (grid.cols - 1 || 1)) * 100}% ${(row / (grid.rows - 1 || 1)) * 100}%`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

Blueprint.displayName = 'Blueprint';

// ─── PieceTile ────────────────────────────────────────────────────────────────

function PieceTile({
  piece,
  imageUrl,
  grid,
  cellW,
  cellH,
  isDragging,
  onPointerDown,
}: {
  piece: PuzzlePiece;
  imageUrl: string;
  grid: { rows: number; cols: number };
  cellW: number;
  cellH: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent, piece: PuzzlePiece) => void;
}) {
  return (
    <div
      onPointerDown={(e) => onPointerDown(e, piece)}
      className={`rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-opacity touch-none ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
      style={{
        width: cellW,
        height: cellH,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
        backgroundPosition: `${(piece.col / (grid.cols - 1 || 1)) * 100}% ${(piece.row / (grid.rows - 1 || 1)) * 100}%`,
      }}
      role="button"
      tabIndex={0}
      aria-label={`Puzzle piece row ${piece.row + 1}, column ${piece.col + 1}. Drag to board.`}
      aria-pressed={isDragging}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Keyboard activation would require implementation of keyboard-based positioning
          // For now, just announce to screen readers
        }
      }}
    />
  );
}

// ─── FloatingPiece ───────────────────────────────────────────────────────────

function FloatingPiece({
  piece,
  imageUrl,
  grid,
  cellW,
  cellH,
  x,
  y,
  isRejected,
}: {
  piece: PuzzlePiece;
  imageUrl: string;
  grid: { rows: number; cols: number };
  cellW: number;
  cellH: number;
  x: number;
  y: number;
  isRejected?: boolean;
}) {
  return (
    <div
      className={`fixed pointer-events-none rounded-2xl overflow-hidden shadow-xl z-50 opacity-90 ${isRejected ? 'piece-rejected' : ''}`}
      style={{
        width: cellW,
        height: cellH,
        left: x - cellW / 2,
        top: y - cellH / 2,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
        backgroundPosition: `${(piece.col / (grid.cols - 1 || 1)) * 100}% ${(piece.row / (grid.rows - 1 || 1)) * 100}%`,
      }}
    />
  );
}

// ─── CompletionOverlay ────────────────────────────────────────────────────────

function CompletionOverlay({
  onPlayAgain,
  onNewPuzzle,
}: {
  onPlayAgain: () => void;
  onNewPuzzle: () => void;
}) {
  const confettiPieces = Array.from({ length: 30 });
  const colors = ['bg-brand-orange', 'bg-brand-teal', 'bg-brand-yellow', 'bg-brand-purple', 'bg-brand-cream'];
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40"
      role="presentation"
    >
      {/* Confetti */}
      {confettiPieces.map((_, i) => (
        <div
          key={i}
          className={`confetti confetti-piece ${colors[i % colors.length]}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            '--tx': `${(Math.random() - 0.5) * 200}px`,
            animationDelay: `${Math.random() * 200}ms`,
          } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}

      <div
        ref={dialogRef}
        className="bg-brand-cream dark:bg-brand-purple rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl completion-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        aria-describedby="completion-message"
        tabIndex={-1}
      >
        <p id="completion-title" className="text-2xl font-semibold text-brand-purple dark:text-brand-cream">Puzzle complete!</p>
        <p id="completion-message" className="sr-only">Congratulations! You have successfully completed the puzzle. You can play again with the same image or start a new puzzle.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onPlayAgain}
            className="px-5 py-2 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium transition-colors"
            aria-label="Shuffle and play this puzzle again"
          >
            Play again
          </button>
          <button
            onClick={onNewPuzzle}
            className="px-5 py-2 rounded-full border border-brand-purple/25 dark:border-brand-cream/25 hover:border-brand-orange font-medium transition-colors"
            aria-label="Return to puzzle selection to start a new puzzle (Escape)"
          >
            New puzzle
          </button>
        </div>
      </div>
    </div>
  );
}

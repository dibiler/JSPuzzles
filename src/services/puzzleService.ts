import type { PuzzlePiece, Grid } from '../types';

export function generatePieces(grid: Grid): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      pieces.push({ id: `${row}-${col}`, row, col });
    }
  }
  return shuffle(pieces);
}

export function isCorrectPlacement(piece: PuzzlePiece, targetRow: number, targetCol: number): boolean {
  return piece.row === targetRow && piece.col === targetCol;
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

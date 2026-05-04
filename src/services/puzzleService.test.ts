import { describe, it, expect } from 'vitest';
import { generatePieces, isCorrectPlacement } from '../services/puzzleService';

describe('generatePieces', () => {
  it('produces rows × cols pieces', () => {
    const pieces = generatePieces({ rows: 3, cols: 4 });
    expect(pieces).toHaveLength(12);
  });

  it('assigns each cell exactly one piece', () => {
    const grid = { rows: 3, cols: 4 };
    const pieces = generatePieces(grid);
    const positions = new Set(pieces.map((p) => `${p.row}-${p.col}`));
    expect(positions.size).toBe(12);
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        expect(positions.has(`${r}-${c}`)).toBe(true);
      }
    }
  });

  it('piece id matches its row-col coordinates', () => {
    const pieces = generatePieces({ rows: 2, cols: 2 });
    for (const piece of pieces) {
      expect(piece.id).toBe(`${piece.row}-${piece.col}`);
    }
  });

  it('shuffles pieces (not always in order)', () => {
    // Run many times — extremely unlikely all 20 trials produce sorted order
    const grid = { rows: 4, cols: 5 };
    let seenShuffled = false;
    for (let i = 0; i < 20; i++) {
      const pieces = generatePieces(grid);
      const inOrder = pieces.every((p, idx) => {
        const row = Math.floor(idx / grid.cols);
        const col = idx % grid.cols;
        return p.row === row && p.col === col;
      });
      if (!inOrder) { seenShuffled = true; break; }
    }
    expect(seenShuffled).toBe(true);
  });
});

describe('isCorrectPlacement', () => {
  it('returns true when piece matches the target cell', () => {
    const piece = { id: '2-3', row: 2, col: 3 };
    expect(isCorrectPlacement(piece, 2, 3)).toBe(true);
  });

  it('returns false when row is wrong', () => {
    const piece = { id: '2-3', row: 2, col: 3 };
    expect(isCorrectPlacement(piece, 1, 3)).toBe(false);
  });

  it('returns false when col is wrong', () => {
    const piece = { id: '2-3', row: 2, col: 3 };
    expect(isCorrectPlacement(piece, 2, 0)).toBe(false);
  });

  it('returns false when both are wrong', () => {
    const piece = { id: '0-0', row: 0, col: 0 };
    expect(isCorrectPlacement(piece, 3, 3)).toBe(false);
  });
});

// A stored image persisted in IndexedDB
export interface StoredImage {
  id: string;
  name: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: number;
}

// One cell in the puzzle grid
export interface PuzzlePiece {
  id: string;
  row: number;
  col: number;
}

// The active grid dimensions
export interface Grid {
  rows: number;
  cols: number;
}

// The full puzzle session (ephemeral)
export interface PuzzleSession {
  image: StoredImage;
  grid: Grid;
  pieces: PuzzlePiece[];         // all pieces, shuffled
  placedIds: Set<string>;        // ids of correctly placed pieces
}

// App-level navigation
export type Screen = 'selection' | 'game';

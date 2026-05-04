import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { PuzzleSession, StoredImage, Grid } from '../types';
import { generatePieces, isCorrectPlacement } from '../services/puzzleService';

type PuzzleAction =
  | { type: 'START'; image: StoredImage; grid: Grid }
  | { type: 'PLACE'; pieceId: string; targetRow: number; targetCol: number }
  | { type: 'RESET' };

function reducer(state: PuzzleSession | null, action: PuzzleAction): PuzzleSession | null {
  switch (action.type) {
    case 'START':
      return {
        image: action.image,
        grid: action.grid,
        pieces: generatePieces(action.grid),
        placedIds: new Set(),
      };
    case 'PLACE': {
      if (!state) return null;
      const piece = state.pieces.find((p) => p.id === action.pieceId);
      if (!piece) return state;
      if (!isCorrectPlacement(piece, action.targetRow, action.targetCol)) return state;
      return { ...state, placedIds: new Set([...state.placedIds, action.pieceId]) };
    }
    case 'RESET':
      if (!state) return null;
      return {
        ...state,
        pieces: generatePieces(state.grid),
        placedIds: new Set(),
      };
    default:
      return state;
  }
}

interface PuzzleContextValue {
  session: PuzzleSession | null;
  startPuzzle: (image: StoredImage, grid: Grid) => void;
  placePiece: (pieceId: string, targetRow: number, targetCol: number) => void;
  resetPuzzle: () => void;
  isComplete: boolean;
}

const PuzzleContext = createContext<PuzzleContextValue | null>(null);

export function PuzzleProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(reducer, null);

  const isComplete = session !== null && session.placedIds.size === session.pieces.length;

  return (
    <PuzzleContext.Provider
      value={{
        session,
        isComplete,
        startPuzzle: (image, grid) => dispatch({ type: 'START', image, grid }),
        placePiece: (pieceId, targetRow, targetCol) =>
          dispatch({ type: 'PLACE', pieceId, targetRow, targetCol }),
        resetPuzzle: () => dispatch({ type: 'RESET' }),
      }}
    >
      {children}
    </PuzzleContext.Provider>
  );
}

export function usePuzzle() {
  const ctx = useContext(PuzzleContext);
  if (!ctx) throw new Error('usePuzzle must be used within PuzzleProvider');
  return ctx;
}

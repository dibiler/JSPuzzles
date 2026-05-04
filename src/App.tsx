import { useState, useEffect } from 'react';
import { ImageProvider } from './contexts/ImageContext';
import { PuzzleProvider, usePuzzle } from './contexts/PuzzleContext';
import { PuzzleSelector } from './screens/PuzzleSelector/PuzzleSelector';
import { PuzzleGame } from './screens/PuzzleGame/PuzzleGame';
import type { StoredImage, Grid, Screen } from './types';

export default function App() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return (
    <ImageProvider>
      <PuzzleProvider>
        <AppRouter dark={dark} onToggleTheme={toggleTheme} />
      </PuzzleProvider>
    </ImageProvider>
  );
}

function AppRouter({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const { startPuzzle } = usePuzzle();
  const [screen, setScreen] = useState<Screen>('selection');

  function handleStart(image: StoredImage, grid: Grid) {
    startPuzzle(image, grid);
    setScreen('game');
  }

  if (screen === 'game') {
    return <PuzzleGame onBack={() => setScreen('selection')} dark={dark} onToggleTheme={onToggleTheme} />;
  }
  return <PuzzleSelector onStart={handleStart} dark={dark} onToggleTheme={onToggleTheme} />;
}

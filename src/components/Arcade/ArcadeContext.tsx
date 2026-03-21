'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ArcadeGame = 'stack-reactor' | 'docking-rush';

type ArcadeContextValue = {
  isArcadeOpen: boolean;
  selectedGame: ArcadeGame;
  openArcade: (game?: ArcadeGame) => void;
  closeArcade: () => void;
  setSelectedGame: (game: ArcadeGame) => void;
};

const ArcadeContext = createContext<ArcadeContextValue | null>(null);

export function ArcadeProvider({ children }: { children: React.ReactNode }) {
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<ArcadeGame>('stack-reactor');

  const openArcade = useCallback((game?: ArcadeGame) => {
    if (game) {
      setSelectedGame(game);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('arcade_seen', 'true');
    }

    setIsArcadeOpen(true);
  }, []);

  const closeArcade = useCallback(() => {
    setIsArcadeOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isArcadeOpen,
      selectedGame,
      openArcade,
      closeArcade,
      setSelectedGame,
    }),
    [isArcadeOpen, selectedGame, openArcade, closeArcade],
  );

  return <ArcadeContext.Provider value={value}>{children}</ArcadeContext.Provider>;
}

export function useArcade() {
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error('useArcade must be used within ArcadeProvider');
  }

  return context;
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useArcade } from '@/components/Arcade/ArcadeContext';
import StackReactor from '@/components/Arcade/games/StackReactor';
import DockingRush from '@/components/Arcade/games/DockingRush';

const SHELL_CLOSE_MS = 170;

export default function ArcadeShell() {
  const { isArcadeOpen, closeArcade, selectedGame, setSelectedGame } = useArcade();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isArcadeOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return;
    }

    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    const timeout = window.setTimeout(() => {
      setIsMounted(false);
    }, SHELL_CLOSE_MS);

    return () => window.clearTimeout(timeout);
  }, [isArcadeOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  const activeGame = useMemo(() => {
    if (!isMounted || !isArcadeOpen) return null;
    return selectedGame === 'stack-reactor' ? <StackReactor isActive={isArcadeOpen} /> : <DockingRush isActive={isArcadeOpen} />;
  }, [isMounted, isArcadeOpen, selectedGame]);

  if (!isMounted) return null;

  return (
    <div className={`arcade-shell ${isArcadeOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Arcade">
      <div className="arcade-shell-inner" data-cursor-ignore="true">
        <header className="arcade-shell-head">
          <p className="arcade-shell-kicker">Arcade</p>
          <div className="arcade-shell-tabs" role="tablist" aria-label="Arcade game picker">
            <button
              type="button"
              role="tab"
              aria-selected={selectedGame === 'stack-reactor'}
              className={`arcade-shell-tab ${selectedGame === 'stack-reactor' ? 'is-active' : ''}`}
              onClick={() => setSelectedGame('stack-reactor')}
            >
              Stack Reactor
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedGame === 'docking-rush'}
              className={`arcade-shell-tab ${selectedGame === 'docking-rush' ? 'is-active' : ''}`}
              onClick={() => setSelectedGame('docking-rush')}
            >
              Docking Rush
            </button>
          </div>
          <button type="button" className="arcade-shell-close" onClick={closeArcade} aria-label="Close arcade">
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>

        <div className="arcade-shell-viewport">{activeGame}</div>
      </div>
    </div>
  );
}

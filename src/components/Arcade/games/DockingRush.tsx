'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Mode = 'normal' | 'chaos';
type Phase = 'ready' | 'playing' | 'result';

type Ship = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const TIME_LIMIT = 45;
const RESULT_HOLD_MS = 2000;
const STORAGE_KEY = 'arcade_docking_rush_best';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const gradeForScore = (score: number) => {
  if (score >= 10) return { grade: 'S', line: 'Docking bay now accepts your autograph.' };
  if (score >= 8) return { grade: 'A', line: 'Mission control is pretending not to smile.' };
  if (score >= 6) return { grade: 'B', line: 'Solid docking. Minimal panic.' };
  if (score >= 4) return { grade: 'C', line: 'Technically attached counts.' };
  if (score >= 2) return { grade: 'D', line: 'You found the ring eventually.' };
  return { grade: 'F', line: 'Space remains undefeated.' };
};

type DockingRushProps = {
  isActive: boolean;
};

export default function DockingRush({ isActive }: DockingRushProps) {
  const [mode, setMode] = useState<Mode>('normal');
  const [phase, setPhase] = useState<Phase>('ready');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<Record<Mode, number>>({ normal: 0, chaos: 0 });
  const [newBest, setNewBest] = useState(false);
  const [resultScore, setResultScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holdRef = useRef(false);
  const shipRef = useRef<Ship>({ x: 0, y: 0, vx: 0, vy: 0 });
  const ringAngleRef = useRef(0);
  const ringSpeedRef = useRef(0.015);
  const dockWindowRef = useRef(0.6);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const hasCollidedRef = useRef(false);

  const hydrateBest = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<Mode, number>>;
      setBest({ normal: parsed.normal ?? 0, chaos: parsed.chaos ?? 0 });
    } catch {
      // ignore invalid storage
    }
  }, []);

  const persistBest = useCallback((next: Record<Mode, number>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const initRound = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    shipRef.current = {
      x: canvas.width * 0.16,
      y: canvas.height * 0.52,
      vx: 0,
      vy: 0,
    };
    ringAngleRef.current = 0;
    ringSpeedRef.current = mode === 'chaos' ? 0.024 : 0.016;
    dockWindowRef.current = mode === 'chaos' ? 0.42 : 0.58;
    hasCollidedRef.current = false;
  }, [mode]);

  const resetRound = useCallback(() => {
    setPhase('ready');
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setResultScore(0);
    setNewBest(false);
    holdRef.current = false;
    initRound();
  }, [initRound]);

  const startRound = useCallback(() => {
    if (!isActive) return;
    setPhase('playing');
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setNewBest(false);
    holdRef.current = false;
    initRound();
  }, [isActive, initRound]);

  const handleAgain = useCallback(() => {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    startRound();
  }, [startRound]);

  const completeDock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setScore((prev) => {
      const next = prev + 1;
      ringSpeedRef.current += mode === 'chaos' ? 0.006 : 0.004;
      dockWindowRef.current = clamp(dockWindowRef.current - (mode === 'chaos' ? 0.045 : 0.03), 0.18, 0.7);
      shipRef.current = {
        x: canvas.width * 0.16,
        y: canvas.height * 0.52,
        vx: 0,
        vy: 0,
      };
      hasCollidedRef.current = false;
      return next;
    });
  }, [mode]);

  const finishRound = useCallback((finalScore: number) => {
    setPhase('result');
    setResultScore(finalScore);

    setBest((prev) => {
      if (finalScore <= prev[mode]) return prev;
      const next = { ...prev, [mode]: finalScore };
      setNewBest(true);
      persistBest(next);
      return next;
    });

    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }

    restartTimeoutRef.current = window.setTimeout(() => {
      resetRound();
    }, RESULT_HOLD_MS);
  }, [mode, persistBest, resetRound]);

  useEffect(() => {
    hydrateBest();
  }, [hydrateBest]);

  useEffect(() => {
    if (!isActive) {
      setPhase('ready');
      return;
    }

    const id = window.requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width * ratio));
      canvas.height = Math.max(220, Math.floor(rect.height * ratio));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      resetRound();
    });

    return () => window.cancelAnimationFrame(id);
  }, [isActive, resetRound]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishRound(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [phase, isActive, finishRound, score]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        holdRef.current = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        holdRef.current = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [phase, isActive]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const ratio = window.devicePixelRatio || 1;
      const width = canvas.width / ratio;
      const height = canvas.height / ratio;
      const cx = width * 0.62;
      const cy = height * 0.5;
      const ringRadius = Math.min(width, height) * 0.24;
      const ringThickness = Math.max(12, Math.min(width, height) * 0.03);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const ship = shipRef.current;
      const dx = cx - ship.x;
      const dy = cy - ship.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const ux = dx / dist;
      const uy = dy / dist;
      const isChaos = mode === 'chaos';

      const thrust = holdRef.current ? (isChaos ? 0.2 : 0.165) : 0;
      const drift = isChaos ? Math.sin(performance.now() * 0.003 + score) * 0.08 : 0;

      ship.vx += ux * thrust;
      ship.vy += uy * thrust + drift;
      ship.vx *= 0.985;
      ship.vy *= 0.985;

      ship.x += ship.vx;
      ship.y += ship.vy;

      ship.x = clamp(ship.x, 8, width - 8);
      ship.y = clamp(ship.y, 8, height - 8);

      ringAngleRef.current += ringSpeedRef.current;

      const hitOuter = dist <= ringRadius + ringThickness;
      const hitInner = dist >= ringRadius - ringThickness;
      const touchingBand = hitOuter && hitInner;

      if (touchingBand && !hasCollidedRef.current) {
        hasCollidedRef.current = true;
        const hitAngle = Math.atan2(ship.y - cy, ship.x - cx);
        const windowCenter = ringAngleRef.current;
        const delta = Math.atan2(Math.sin(hitAngle - windowCenter), Math.cos(hitAngle - windowCenter));
        const inWindow = Math.abs(delta) <= dockWindowRef.current * 0.5;

        if (inWindow) {
          completeDock();
        } else {
          finishRound(score);
        }
      }

      if (!touchingBand) {
        hasCollidedRef.current = false;
      }

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = ringThickness;
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#c8ff00';
      ctx.lineWidth = ringThickness + 1;
      ctx.arc(cx, cy, ringRadius, ringAngleRef.current - dockWindowRef.current / 2, ringAngleRef.current + dockWindowRef.current / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = '#f0ece4';
      ctx.rect(ship.x - 7, ship.y - 7, 14, 14);
      ctx.fill();

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [phase, isActive, mode, score, completeDock, finishRound]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  const gradeMeta = useMemo(() => gradeForScore(resultScore), [resultScore]);

  return (
    <section className="arcade-game docking-rush" data-cursor-ignore="true">
      <header className="arcade-game-hud">
        <div className="arcade-game-meta">
          <span className="arcade-game-pill">Docking Rush</span>
          <span className="arcade-game-pill">Time {timeLeft}s</span>
          <span className="arcade-game-pill">Score {score}</span>
          <span className="arcade-game-pill">Best {best[mode]}</span>
        </div>
        <div className="arcade-game-controls" role="group" aria-label="Docking Rush controls">
          <button
            type="button"
            className={`arcade-chip ${mode === 'normal' ? 'is-active' : ''}`}
            onClick={() => setMode('normal')}
          >
            Normal
          </button>
          <button
            type="button"
            className={`arcade-chip ${mode === 'chaos' ? 'is-active' : ''}`}
            onClick={() => setMode('chaos')}
          >
            Chaos
          </button>
          <button type="button" className="arcade-chip" onClick={resetRound}>
            Reset
          </button>
        </div>
      </header>

      <div className="arcade-stage docking-stage" data-cursor-ignore="true">
        <canvas
          ref={canvasRef}
          className="docking-canvas"
          onPointerDown={() => {
            holdRef.current = true;
          }}
          onPointerUp={() => {
            holdRef.current = false;
          }}
          onPointerLeave={() => {
            holdRef.current = false;
          }}
          onPointerCancel={() => {
            holdRef.current = false;
          }}
          aria-label="Docking Rush game canvas"
        />

        {phase === 'ready' ? (
          <div className="arcade-overlay-card">
            <p className="arcade-overlay-title">Docking Rush</p>
            <p className="arcade-overlay-copy">Hold to thrust, release to coast. Enter through the glowing arc only.</p>
            <button type="button" className="arcade-btn" onClick={startRound}>Start</button>
          </div>
        ) : null}

        {phase === 'result' ? (
          <div className="arcade-result-sheet">
            <p className="arcade-result-grade">{gradeMeta.grade}</p>
            <p className="arcade-result-line">{gradeMeta.line}</p>
            <p className="arcade-result-score">Score {resultScore}</p>
            <p className="arcade-result-score">{newBest ? 'New Best!' : `Best ${best[mode]}`}</p>
            <button type="button" className="arcade-btn" onClick={handleAgain}>Again</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

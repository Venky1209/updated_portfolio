'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Mode = 'normal' | 'chaos';
type Phase = 'ready' | 'playing' | 'result';

type Seed = {
  id: number;
  char: string;
  xPct: number;
  rotate: number;
  accent?: boolean;
};

type Piece = Seed & {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type LinkSegment = {
  a: number;
  b: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DragState = {
  id: number;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  moved: boolean;
};

const LETTERS: Seed[] = [
  { id: 0, char: 'L', xPct: 4, rotate: 0 },
  { id: 1, char: 'E', xPct: 10, rotate: 0 },
  { id: 2, char: 'T', xPct: 16, rotate: 0 },
  { id: 3, char: "'", xPct: 20.2, rotate: 0 },
  { id: 4, char: 'S', xPct: 23.7, rotate: 0 },
  { id: 5, char: 'B', xPct: 31.5, rotate: 0 },
  { id: 6, char: 'U', xPct: 37.8, rotate: 0 },
  { id: 7, char: 'I', xPct: 44.3, rotate: 0 },
  { id: 8, char: 'L', xPct: 48.2, rotate: 0 },
  { id: 9, char: 'D', xPct: 54.2, rotate: 0 },
  { id: 10, char: 'S', xPct: 3.8, rotate: 0, accent: true },
  { id: 11, char: 'O', xPct: 10.8, rotate: 0, accent: true },
  { id: 12, char: 'M', xPct: 18.2, rotate: 0, accent: true },
  { id: 13, char: 'E', xPct: 26.8, rotate: 0, accent: true },
  { id: 14, char: 'T', xPct: 34.5, rotate: -12, accent: true },
  { id: 15, char: 'H', xPct: 42.8, rotate: -12, accent: true },
  { id: 16, char: 'I', xPct: 49.2, rotate: 0, accent: true },
  { id: 17, char: 'N', xPct: 53.8, rotate: 0, accent: true },
  { id: 18, char: 'G', xPct: 61.3, rotate: 0, accent: true },
];

const NORMAL_LIMIT = 35;
const CHAOS_LIMIT = 24;
const NORMAL_TARGET = 12;
const CHAOS_TARGET = 14;
const RESULT_HOLD_MS = 2000;
const STORAGE_KEY = 'arcade_stack_reactor_best';
const MAGNET_BASE_RANGE = 2.05;

const gradeForScore = (score: number, target: number) => {
  if (score >= target + 4) return { grade: 'S', line: 'Gravity filed a complaint.' };
  if (score >= target + 2) return { grade: 'A', line: 'Clean stack. Minimal drama.' };
  if (score >= target) return { grade: 'B', line: 'Functional tower. Approved.' };
  if (score >= Math.floor(target * 0.8)) return { grade: 'C', line: 'Held together by optimism.' };
  if (score >= Math.floor(target * 0.6)) return { grade: 'D', line: 'Interesting geometry choice.' };
  return { grade: 'F', line: 'The floor won this round.' };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function makePieces(width: number, height: number): Piece[] {
  const radius = clamp(width * 0.034, 16, 30);
  const y = height - radius - 2;
  return LETTERS.map((seed) => ({
    ...seed,
    x: (seed.xPct / 100) * width,
    y,
    vx: 0,
    vy: 0,
  }));
}

type StackReactorProps = {
  isActive: boolean;
};

export default function StackReactor({ isActive }: StackReactorProps) {
  const [mode, setMode] = useState<Mode>('normal');
  const [phase, setPhase] = useState<Phase>('ready');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [stackCount, setStackCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(NORMAL_LIMIT);
  const [best, setBest] = useState<Record<Mode, number>>({ normal: 0, chaos: 0 });
  const [newBest, setNewBest] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [links, setLinks] = useState<LinkSegment[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<Piece[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  const timeLimit = mode === 'chaos' ? CHAOS_LIMIT : NORMAL_LIMIT;
  const target = mode === 'chaos' ? CHAOS_TARGET : NORMAL_TARGET;

  const hydrateBest = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<Mode, number>>;
      setBest({
        normal: parsed.normal ?? 0,
        chaos: parsed.chaos ?? 0,
      });
    } catch {
      // ignore broken storage data
    }
  }, []);

  const persistBest = useCallback((next: Record<Mode, number>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetRound = useCallback(() => {
    const board = boardRef.current;
    const width = board?.clientWidth || 920;
    const height = board?.clientHeight || 420;
    const seeded = makePieces(width, height);

    piecesRef.current = seeded;
    setPieces(seeded);
    setStackCount(0);
    setActivePieceId(null);
    dragRef.current = null;
    setTimeLeft(timeLimit);
    setNewBest(false);
    setResultScore(0);
    setLinks([]);
    setPhase('ready');
  }, [timeLimit]);

  const startRound = useCallback(() => {
    if (!isActive) return;
    setPhase('playing');
    setTimeLeft(timeLimit);
    setNewBest(false);
  }, [isActive, timeLimit]);

  const handleAgain = useCallback(() => {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    startRound();
  }, [startRound]);

  const endRound = useCallback((finalScore: number) => {
    setResultScore(finalScore);
    setPhase('result');

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
    resetRound();
  }, [mode, resetRound]);

  useEffect(() => {
    if (!isActive) {
      setPhase('ready');
      return;
    }

    const id = window.requestAnimationFrame(() => {
      resetRound();
    });

    return () => window.cancelAnimationFrame(id);
  }, [isActive, resetRound]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endRound(stackCount);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [phase, isActive, endRound, stackCount]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;
    if (stackCount < target) return;

    endRound(stackCount);
  }, [phase, isActive, stackCount, target, endRound]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    const tick = () => {
      const board = boardRef.current;
      if (!board) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const width = board.clientWidth;
      const height = board.clientHeight;
      const goalY = height * 0.42;
      const isChaos = mode === 'chaos';
      const gravity = isChaos ? 0.1 : 0.075;
      const friction = isChaos ? 0.996 : 0.997;
      const bounce = isChaos ? 0.2 : 0.12;
      const radius = clamp(width * 0.034, 16, 30);
      const floorY = height - radius;
      const activeId = dragRef.current?.id ?? null;

      for (let i = 0; i < piecesRef.current.length; i += 1) {
        const piece = piecesRef.current[i];
        if (piece.id === activeId) continue;

        const assistZone = piece.y <= goalY + radius * 1.45;
        const gravityScale = assistZone ? (isChaos ? 0.55 : 0.33) : 1;
        const gravityMass = piece.accent ? 0.86 : 1;

        const drift = isChaos ? (Math.sin((performance.now() + piece.id * 37) * 0.003) * 0.014) : 0;

        piece.vy += gravity * gravityScale * gravityMass;
        piece.vx += drift;

        piece.vx *= friction;
        piece.vy *= friction;

        if (assistZone) {
          piece.vy = Math.min(piece.vy, isChaos ? 1.02 : 0.62);
          piece.vx *= isChaos ? 0.985 : 0.975;
        } else {
          piece.vy = Math.min(piece.vy, isChaos ? 1.8 : 1.05);
        }

        const onSurface = piece.y >= floorY - 2.5 && Math.abs(piece.vy) < 0.24;
        if (onSurface) {
          piece.vx *= isChaos ? 0.68 : 0.52;
          if (Math.abs(piece.vx) < (isChaos ? 0.08 : 0.045)) {
            piece.vx = 0;
          }
        }

        piece.x += piece.vx;
        piece.y += piece.vy;

        if (piece.x < radius) {
          piece.x = radius;
          piece.vx *= -bounce;
        }
        if (piece.x > width - radius) {
          piece.x = width - radius;
          piece.vx *= -bounce;
        }
        if (piece.y < radius) {
          piece.y = radius;
          piece.vy *= -bounce;
        }
        if (piece.y > floorY) {
          piece.y = floorY;
          piece.vy *= -bounce;
          piece.vx *= isChaos ? 0.68 : 0.45;
          if (Math.abs(piece.vy) < (isChaos ? 0.12 : 0.055)) piece.vy = 0;
          if (Math.abs(piece.vx) < (isChaos ? 0.09 : 0.05)) piece.vx = 0;
        }
      }

      const minDist = radius * (isChaos ? 1.22 : 1.16);
      const magnetRange = radius * (isChaos ? MAGNET_BASE_RANGE : MAGNET_BASE_RANGE + 0.18);
      const linkCounts = new Array(piecesRef.current.length).fill(0);
      const nextLinks: LinkSegment[] = [];

      for (let i = 0; i < piecesRef.current.length; i += 1) {
        for (let j = i + 1; j < piecesRef.current.length; j += 1) {
          const a = piecesRef.current[i];
          const b = piecesRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const nx = dx / dist;
          const ny = dy / dist;

          if (dist < magnetRange && dist > minDist * 0.9) {
            const pull = ((magnetRange - dist) / magnetRange) * (isChaos ? 0.012 : 0.019);
            const aDragged = a.id === activeId;
            const bDragged = b.id === activeId;

            if (!aDragged) {
              a.vx += nx * pull;
              a.vy += ny * pull * 0.4;
            }
            if (!bDragged) {
              b.vx -= nx * pull;
              b.vy -= ny * pull * 0.4;
            }

            linkCounts[i] += 1;
            linkCounts[j] += 1;
            nextLinks.push({
              a: a.id,
              b: b.id,
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
            });
          }

          if (dist >= minDist) continue;

          const overlap = (minDist - dist) * 0.42;
          const aDragged = a.id === activeId;
          const bDragged = b.id === activeId;
          const impulse = isChaos ? 0.06 : 0.03;
          const horizontal = impulse * (isChaos ? 0.4 : 0.28);
          const vertical = impulse * (isChaos ? 0.78 : 0.66);

          if (!aDragged) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            a.vx -= nx * horizontal;
            a.vy -= ny * vertical;
            a.vx *= isChaos ? 0.91 : 0.84;
            a.vy *= 0.94;
          }

          if (!bDragged) {
            b.x += nx * overlap;
            b.y += ny * overlap;
            b.vx += nx * horizontal;
            b.vy += ny * vertical;
            b.vx *= isChaos ? 0.91 : 0.84;
            b.vy *= 0.94;
          }
        }
      }

      for (let i = 0; i < piecesRef.current.length; i += 1) {
        const piece = piecesRef.current[i];
        if (piece.id === activeId) continue;

        if (linkCounts[i] > 0) {
          piece.vx *= isChaos ? 0.95 : 0.92;
          if (piece.vy > 0) {
            piece.vy *= isChaos ? 0.94 : 0.88;
            piece.vy = Math.min(piece.vy, isChaos ? 1.28 : 0.86);
          }
        }
      }

      const elevated = piecesRef.current.filter((piece) => piece.y < goalY).length;
      setStackCount(elevated);
      setPieces([...piecesRef.current]);
      setLinks(nextLinks);

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [phase, isActive, mode]);

  useEffect(() => {
    if (!isActive || phase !== 'playing') return;

    const onPointerMove = (event: PointerEvent) => {
      const active = dragRef.current;
      const board = boardRef.current;
      if (!active || !board || event.pointerId !== active.pointerId) return;

      const rect = board.getBoundingClientRect();
      const radius = clamp(rect.width * 0.034, 16, 30);
      const x = clamp(event.clientX - rect.left - active.offsetX, radius, rect.width - radius);
      const y = clamp(event.clientY - rect.top - active.offsetY, radius, rect.height - radius);
      const now = performance.now();
      const dt = Math.max(16, now - active.lastTime);
      const movement = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);

      if (movement > 6) active.moved = true;

      piecesRef.current = piecesRef.current.map((piece) => {
        if (piece.id !== active.id) return piece;
        return {
          ...piece,
          x,
          y,
          vx: (x - active.lastX) / (dt / 16),
          vy: (y - active.lastY) / (dt / 16),
        };
      });

      active.lastX = x;
      active.lastY = y;
      active.lastTime = now;
    };

    const onPointerUp = (event: PointerEvent) => {
      const active = dragRef.current;
      if (!active || event.pointerId !== active.pointerId) return;

      const board = boardRef.current;
      if (board) {
        const goalY = board.clientHeight * 0.42;
        const tapBoost = mode === 'chaos' ? -2.55 : -2.05;
        const holdBoost = mode === 'chaos' ? -0.8 : -1.05;

        piecesRef.current = piecesRef.current.map((piece) => {
          if (piece.id !== active.id) return piece;

          if (!active.moved) {
            return {
              ...piece,
              vx: piece.vx + (Math.random() * 0.4 - 0.2),
              vy: tapBoost,
            };
          }

          if (piece.y > goalY + 24) return piece;

          return {
            ...piece,
            vx: piece.vx * 0.74,
            vy: Math.min(piece.vy, holdBoost),
          };
        });
      }

      dragRef.current = null;
      setActivePieceId(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isActive, phase, mode]);

  useEffect(() => {
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>, id: number) => {
    if (phase !== 'playing') return;

    event.preventDefault();

    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const selected = piecesRef.current.find((piece) => piece.id === id);
    if (!selected) return;

    dragRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left - selected.x,
      offsetY: event.clientY - rect.top - selected.y,
      startX: event.clientX,
      startY: event.clientY,
      lastX: selected.x,
      lastY: selected.y,
      lastTime: performance.now(),
      moved: false,
    };

    setActivePieceId(id);
    piecesRef.current = piecesRef.current.map((piece) =>
      piece.id === id
        ? { ...piece, vx: 0, vy: 0 }
        : piece,
    );
  }, [phase]);

  const gradeMeta = useMemo(() => gradeForScore(resultScore, target), [resultScore, target]);

  return (
    <section className="arcade-game stack-reactor" data-cursor-ignore="true">
      <header className="arcade-game-hud">
        <div className="arcade-game-meta">
          <span className="arcade-game-pill">Stack Reactor</span>
          <span className="arcade-game-pill">Target {target}</span>
          <span className="arcade-game-pill">Time {timeLeft}s</span>
          <span className="arcade-game-pill">Score {stackCount}</span>
          <span className="arcade-game-pill">Best {best[mode]}</span>
        </div>
        <div className="arcade-game-controls" role="group" aria-label="Stack Reactor controls">
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

      <div className="arcade-stage" ref={boardRef} data-cursor-ignore="true">
        <div className="arcade-goal-line" aria-hidden="true" />

        {phase === 'ready' ? (
          <div className="arcade-overlay-card">
            <p className="arcade-overlay-title">Ready to stack?</p>
            <p className="arcade-overlay-copy">Tap letters to launch, drag to position, and hold {target} above the line.</p>
            <button type="button" className="arcade-btn" onClick={startRound}>Start</button>
          </div>
        ) : null}

        {pieces.map((piece) => (
          <button
            key={piece.id}
            type="button"
            className={`arcade-letter ${piece.accent ? 'is-accent' : ''} ${activePieceId === piece.id ? 'is-active' : ''}`}
            style={{ left: `${piece.x}px`, top: `${piece.y}px`, transform: `translate(-50%, -50%) rotate(${piece.rotate}deg)` }}
            onPointerDown={(event) => onPointerDown(event, piece.id)}
            aria-label={`Letter ${piece.char}`}
            data-cursor-ignore="true"
          >
            {piece.char}
          </button>
        ))}

        <svg className="arcade-link-layer" aria-hidden="true">
          {links.map((link) => (
            <line
              key={`${link.a}-${link.b}`}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
            />
          ))}
        </svg>

        {phase === 'result' ? (
          <div className="arcade-result-sheet">
            <p className="arcade-result-grade">{gradeMeta.grade}</p>
            <p className="arcade-result-line">{gradeMeta.line}</p>
            <p className="arcade-result-score">Score {resultScore} / Target {target}</p>
            <p className="arcade-result-score">{newBest ? 'New Best!' : `Best ${best[mode]}`}</p>
            <button type="button" className="arcade-btn" onClick={handleAgain}>Again</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PERSONAL } from '@/data/portfolio';
import SectionReveal from '@/components/ui/SectionReveal';
import gsap from 'gsap';
import { useArcade } from '@/components/Arcade/ArcadeContext';

type LetterSeed = {
  id: number;
  char: string;
  xPct: number;
  yPct: number;
  rotate: number;
  accent?: boolean;
};

type LetterPiece = LetterSeed & {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type ActiveDrag = {
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

type PhysicsMode = 'normal' | 'chaos';
type ChallengeState = 'idle' | 'running' | 'won' | 'lost';

const NORMAL_TIME_LIMIT = 45;
const CHAOS_TIME_LIMIT = 30;

const LETTER_SEEDS: LetterSeed[] = [
  { id: 0, char: 'L', xPct: 4, yPct: 22, rotate: 0 },
  { id: 1, char: 'E', xPct: 10, yPct: 22, rotate: 0 },
  { id: 2, char: 'T', xPct: 16, yPct: 22, rotate: 0 },
  { id: 3, char: "'", xPct: 20.2, yPct: 22, rotate: 0 },
  { id: 4, char: 'S', xPct: 23.7, yPct: 22, rotate: 0 },
  { id: 5, char: 'B', xPct: 31.5, yPct: 22, rotate: 0 },
  { id: 6, char: 'U', xPct: 37.8, yPct: 22, rotate: 0 },
  { id: 7, char: 'I', xPct: 44.3, yPct: 22, rotate: 0 },
  { id: 8, char: 'L', xPct: 48.2, yPct: 22, rotate: 0 },
  { id: 9, char: 'D', xPct: 54.2, yPct: 22, rotate: 0 },
  { id: 10, char: 'S', xPct: 3.8, yPct: 69, rotate: 0, accent: true },
  { id: 11, char: 'O', xPct: 10.8, yPct: 69, rotate: 0, accent: true },
  { id: 12, char: 'M', xPct: 18.2, yPct: 69, rotate: 0, accent: true },
  { id: 13, char: 'E', xPct: 26.8, yPct: 69, rotate: 0, accent: true },
  { id: 14, char: 'T', xPct: 34.5, yPct: 69, rotate: -12, accent: true },
  { id: 15, char: 'H', xPct: 42.8, yPct: 69, rotate: -12, accent: true },
  { id: 16, char: 'I', xPct: 49.2, yPct: 69, rotate: 0, accent: true },
  { id: 17, char: 'N', xPct: 53.8, yPct: 69, rotate: 0, accent: true },
  { id: 18, char: 'G', xPct: 61.3, yPct: 69, rotate: 0, accent: true },
];

const TUTORIAL_STEPS = [
  'Tap a letter to pop it upward. It will fall naturally. Drag to place pieces exactly.',
  'Keep letters above the dashed line to build your stack score.',
  'Lime letters are lighter and floatier. Black letters are heavier and steadier.',
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function makePieces(width: number, height: number): LetterPiece[] {
  const radius = clamp(width * 0.034, 16, 30);
  const groundY = height - radius - 2;

  return LETTER_SEEDS.map((seed) => ({
    ...seed,
    x: (seed.xPct / 100) * width,
    y: groundY,
    vx: 0,
    vy: 0,
  }));
}

/* Split text into hoverable letters for the jiggle easter egg */
function JiggleText({ text, className }: { text: string; className?: string }) {
  const handleLetterEnter = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, {
      y: gsap.utils.random(-12, 12),
      x: gsap.utils.random(-6, 6),
      rotation: gsap.utils.random(-15, 15),
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 3,
    });
  }, []);

  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="jiggle-letter"
          onMouseEnter={handleLetterEnter}
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

export default function Contact() {
  const [buildMode, setBuildMode] = useState(false);
  const [pieces, setPieces] = useState<LetterPiece[]>([]);
  const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [stackCount, setStackCount] = useState(0);
  const [physicsMode, setPhysicsMode] = useState<PhysicsMode>('normal');
  const [modeFlash, setModeFlash] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(NORMAL_TIME_LIMIT);
  const [challengeState, setChallengeState] = useState<ChallengeState>('idle');
  const [winTimeLeft, setWinTimeLeft] = useState(0);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [showUnlockHint, setShowUnlockHint] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<LetterPiece[]>([]);
  const dragRef = useRef<ActiveDrag | null>(null);
  const frameRef = useRef<number | null>(null);
  const stackCountRef = useRef(0);
  const modeFlashTimeoutRef = useRef<number | null>(null);
  const unlockHintTimeoutRef = useRef<number | null>(null);
  const { openArcade } = useArcade();

  const targetCount = physicsMode === 'chaos' ? 14 : 12;
  const timeLimit = physicsMode === 'chaos' ? CHAOS_TIME_LIMIT : NORMAL_TIME_LIMIT;

  const resetPieces = useCallback(() => {
    const board = boardRef.current;
    const width = board?.clientWidth || 920;
    const height = board?.clientHeight || 280;
    const seeded = makePieces(width, height);

    piecesRef.current = seeded;
    setPieces(seeded);
    setActivePieceId(null);
    dragRef.current = null;
    stackCountRef.current = 0;
    setStackCount(0);
    setTimeLeft(timeLimit);
    setShowWinPopup(false);
    setShowUnlockHint(false);
    setWinTimeLeft(0);
    setChallengeState(tutorialOpen ? 'idle' : 'running');
  }, [timeLimit, tutorialOpen]);

  const enterBuildMode = useCallback(() => {
    setBuildMode(true);
    setTutorialOpen(true);
    setChallengeState('idle');
    setShowWinPopup(false);
    setShowUnlockHint(false);
    setWinTimeLeft(0);
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  const exitBuildMode = useCallback(() => {
    setBuildMode(false);
    setActivePieceId(null);
    dragRef.current = null;
    setChallengeState('idle');
    setShowWinPopup(false);
    setShowUnlockHint(false);
    setWinTimeLeft(0);
  }, []);

  const switchMode = useCallback((mode: PhysicsMode) => {
    if (mode === physicsMode) return;

    setPhysicsMode(mode);
    setChallengeState(tutorialOpen ? 'idle' : 'running');
    setShowWinPopup(false);
    setShowUnlockHint(false);
    setWinTimeLeft(0);
    setTimeLeft(mode === 'chaos' ? CHAOS_TIME_LIMIT : NORMAL_TIME_LIMIT);
    if (mode === 'chaos') {
      setModeFlash(true);
      if (modeFlashTimeoutRef.current) {
        window.clearTimeout(modeFlashTimeoutRef.current);
      }
      modeFlashTimeoutRef.current = window.setTimeout(() => {
        setModeFlash(false);
      }, 520);
    }
  }, [physicsMode, tutorialOpen]);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (!buildMode || tutorialOpen || challengeState !== 'running') return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setChallengeState('lost');
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [buildMode, tutorialOpen, challengeState]);

  useEffect(() => {
    if (challengeState !== 'running') return;
    if (stackCount < targetCount) return;

    setChallengeState('won');
    setWinTimeLeft(timeLeft);
    setShowWinPopup(true);
  }, [stackCount, targetCount, timeLeft, challengeState]);

  useEffect(() => {
    if (!showWinPopup) {
      setShowUnlockHint(false);
      if (unlockHintTimeoutRef.current) {
        window.clearTimeout(unlockHintTimeoutRef.current);
      }
      return;
    }

    unlockHintTimeoutRef.current = window.setTimeout(() => {
      setShowUnlockHint(true);
    }, 400);

    return () => {
      if (unlockHintTimeoutRef.current) {
        window.clearTimeout(unlockHintTimeoutRef.current);
      }
    };
  }, [showWinPopup]);

  useEffect(() => {
    if (!buildMode) return;
    const id = window.requestAnimationFrame(() => resetPieces());
    return () => window.cancelAnimationFrame(id);
  }, [buildMode, resetPieces]);

  useEffect(() => {
    if (!buildMode) return;

    const tick = () => {
      const board = boardRef.current;
      if (!board) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const width = board.clientWidth;
      const height = board.clientHeight;
      const goalY = height * 0.42;
      const isChaos = physicsMode === 'chaos';
      const gravity = isChaos ? 0.095 : 0.08;
      const friction = isChaos ? 0.996 : 0.997;
      const bounce = isChaos ? 0.22 : 0.12;
      const radius = clamp(width * 0.034, 16, 30);
      const floorY = height - radius;
      const activeId = dragRef.current?.id ?? null;

      if (challengeState === 'won') {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      for (let i = 0; i < piecesRef.current.length; i += 1) {
        const piece = piecesRef.current[i];
        if (piece.id === activeId) continue;

        const assistZone = piece.y <= goalY + radius * 1.55;
        const gravityScale = assistZone ? (isChaos ? 0.52 : 0.35) : 1;
        const gravityMass = piece.accent ? 0.84 : 1;

        piece.vy += gravity * gravityScale * gravityMass;

        piece.vx *= friction;
        piece.vy *= friction;

        if (assistZone) {
          piece.vy = Math.min(piece.vy, isChaos ? 0.95 : 0.62);
          piece.vx *= isChaos ? 0.986 : 0.975;
        } else {
          piece.vy = Math.min(piece.vy, isChaos ? 1.7 : 1.1);
        }

        if (piece.y < goalY + radius * 0.9 && Math.abs(piece.vy) < 0.16) {
          piece.vy *= isChaos ? 0.62 : 0.45;
          piece.vx *= isChaos ? 0.9 : 0.84;
        }

        const onSurface = piece.y >= floorY - 2.5 && Math.abs(piece.vy) < 0.24;
        if (onSurface) {
          piece.vx *= isChaos ? 0.72 : 0.55;
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
        if (piece.y > height - radius) {
          piece.y = height - radius;
          piece.vy *= -bounce;
          piece.vx *= isChaos ? 0.72 : 0.45;
          if (Math.abs(piece.vy) < (isChaos ? 0.12 : 0.055)) {
            piece.vy = 0;
          }
          if (Math.abs(piece.vx) < (isChaos ? 0.09 : 0.05)) {
            piece.vx = 0;
          }
        }
      }

      const minDist = radius * (isChaos ? 1.24 : 1.16);
      for (let i = 0; i < piecesRef.current.length; i += 1) {
        for (let j = i + 1; j < piecesRef.current.length; j += 1) {
          const a = piecesRef.current[i];
          const b = piecesRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;

          if (dist >= minDist) continue;

          const overlap = (minDist - dist) * (isChaos ? 0.42 : 0.42);
          const nx = dx / dist;
          const ny = dy / dist;
          const aIsDragged = a.id === activeId;
          const bIsDragged = b.id === activeId;
          const impulse = isChaos ? 0.07 : 0.03;
          const horizontalPush = impulse * (isChaos ? 0.42 : 0.3);
          const verticalPush = impulse * (isChaos ? 0.82 : 0.7);

          if (!aIsDragged) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            a.vx -= nx * horizontalPush;
            a.vy -= ny * verticalPush;
            a.vx *= isChaos ? 0.91 : 0.84;
            a.vy *= 0.94;
          }

          if (!bIsDragged) {
            b.x += nx * overlap;
            b.y += ny * overlap;
            b.vx += nx * horizontalPush;
            b.vy += ny * verticalPush;
            b.vx *= isChaos ? 0.91 : 0.84;
            b.vy *= 0.94;
          }
        }
      }

      const elevated = piecesRef.current.filter((piece) => piece.y < goalY).length;
      if (elevated !== stackCountRef.current) {
        stackCountRef.current = elevated;
        setStackCount(elevated);
      }

      setPieces([...piecesRef.current]);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [buildMode, physicsMode, challengeState]);

  useEffect(() => {
    if (!buildMode) return;

    const onPointerMove = (event: PointerEvent) => {
      const active = dragRef.current;
      const board = boardRef.current;
      if (!active || !board || event.pointerId !== active.pointerId) return;

      const rect = board.getBoundingClientRect();
      const radius = clamp(rect.width * 0.034, 16, 30);
      const x = clamp(event.clientX - rect.left - active.offsetX, radius, rect.width - radius);
      const y = clamp(event.clientY - rect.top - active.offsetY, radius, rect.height - radius);
      const nextTime = performance.now();
      const dt = Math.max(16, nextTime - active.lastTime);
      const movement = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);

      if (movement > 6) {
        active.moved = true;
      }

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
      active.lastTime = nextTime;
    };

    const onPointerUp = (event: PointerEvent) => {
      const active = dragRef.current;
      if (!active || event.pointerId !== active.pointerId) return;

      const board = boardRef.current;
      if (board) {
        const goalY = board.clientHeight * 0.42;
        const tapBoost = physicsMode === 'chaos' ? -2.65 : -2.05;
        const holdBoost = physicsMode === 'chaos' ? -0.8 : -1.1;

        piecesRef.current = piecesRef.current.map((piece) => {
          if (piece.id !== active.id) return piece;

          if (!active.moved) {
            return {
              ...piece,
              vx: piece.vx + gsap.utils.random(-0.2, 0.2),
              vy: tapBoost,
            };
          }

          if (piece.y > goalY + 24) return piece;
          return {
            ...piece,
            vx: piece.vx * 0.75,
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
  }, [buildMode, physicsMode]);

  useEffect(() => {
    return () => {
      if (modeFlashTimeoutRef.current) {
        window.clearTimeout(modeFlashTimeoutRef.current);
      }
      if (unlockHintTimeoutRef.current) {
        window.clearTimeout(unlockHintTimeoutRef.current);
      }
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, id: number) => {
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
          ? {
              ...piece,
              vx: 0,
              vy: 0,
            }
          : piece,
      );
    },
    [],
  );

  return (
    <SectionReveal id="contact" className="contact-section">
      <div className="section-container">
        <div className="section-label">
          <span>06 / Contact</span>
        </div>
        {!buildMode ? (
          <h2 className="contact-heading" onDoubleClick={enterBuildMode} title="Double-click to unlock Build Mode">
            <JiggleText text="Let's build" />
            <br />
            <JiggleText text="something" className="contact-heading-accent" />
            <span className="contact-easter-hint">double-click headline for build mode</span>
          </h2>
        ) : (
          <div className="build-mode-wrap" data-cursor-ignore="true">
            <div className="build-mode-topbar">
              <p className="build-mode-title">Stack challenge: drag letters and hold {targetCount} above the line.</p>
              <div className="build-mode-actions">
                <div className="build-mode-switch" role="group" aria-label="Game mode" data-cursor-ignore="true">
                  <button
                    type="button"
                    className={`build-mode-chip ${physicsMode === 'normal' ? 'is-active' : ''}`}
                    onClick={() => switchMode('normal')}
                    data-cursor-ignore="true"
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    className={`build-mode-chip is-chaos ${physicsMode === 'chaos' ? 'is-active' : ''}`}
                    onClick={() => switchMode('chaos')}
                    data-cursor-ignore="true"
                  >
                    Chaos
                  </button>
                </div>
                <button type="button" className="build-mode-btn" onClick={resetPieces}>
                  Reset
                </button>
                <button type="button" className="build-mode-btn is-ghost" onClick={exitBuildMode}>
                  Exit
                </button>
              </div>
            </div>
            <div
              className={`build-mode-board ${physicsMode === 'chaos' ? 'is-chaos' : ''} ${modeFlash ? 'is-mode-flash' : ''} ${tutorialOpen ? 'is-locked' : ''} ${showWinPopup ? 'is-win' : ''}`}
              ref={boardRef}
              aria-label="Letter builder playground"
              data-cursor-ignore="true"
            >
              <div className="build-mode-goal-line" aria-hidden="true" />
              <div className="build-mode-hud">
                <p className="build-mode-score">
                  {stackCount >= targetCount
                    ? 'Dock Complete'
                    : `Stack ${stackCount}/${targetCount}`}
                </p>
                <p className="build-mode-score build-mode-timer">
                  {challengeState === 'won' ? 'Timer: Cleared' : `Time ${timeLeft}s`}
                </p>
                <div className="build-mode-legend" aria-label="Letter type legend">
                  <span className="build-legend-item">
                    <i className="build-legend-dot is-core" />
                    Heavy and stable
                  </span>
                  <span className="build-legend-item">
                    <i className="build-legend-dot is-accent" />
                    Light and floaty
                  </span>
                </div>
              </div>
              {tutorialOpen ? (
                <div className="build-tutorial" data-cursor-ignore="true">
                  <div className="build-tutorial-card">
                    <p className="build-tutorial-kicker">How to play</p>
                    <p className="build-tutorial-text">{TUTORIAL_STEPS[0]}</p>
                    <p className="build-tutorial-text">{TUTORIAL_STEPS[1]}</p>
                    <p className="build-tutorial-text">{TUTORIAL_STEPS[2]}</p>
                  </div>
                  <div className="build-tutorial-actions">
                    <button
                      type="button"
                      className="build-tutorial-btn is-next"
                      onClick={() => {
                        setTutorialOpen(false);
                        setTimeLeft(timeLimit);
                        setChallengeState('running');
                        setShowWinPopup(false);
                      }}
                      data-cursor-ignore="true"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      className="build-tutorial-btn is-ghost"
                      onClick={() => {
                        setTutorialOpen(false);
                        setTimeLeft(timeLimit);
                        setChallengeState('running');
                        setShowWinPopup(false);
                      }}
                      data-cursor-ignore="true"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ) : null}
              {!tutorialOpen && !showWinPopup
                ? pieces.map((piece) => (
                <button
                  key={piece.id}
                  type="button"
                  className={`build-letter ${piece.accent ? 'is-accent' : ''} ${activePieceId === piece.id ? 'is-active' : ''}`}
                  style={{ left: `${piece.x}px`, top: `${piece.y}px`, transform: `translate(-50%, -50%) rotate(${piece.rotate}deg)` }}
                  onPointerDown={(event) => handlePointerDown(event, piece.id)}
                  data-cursor-ignore="true"
                  aria-label={`Letter ${piece.char}`}
                >
                  {piece.char}
                </button>
                  ))
                : null}

              {challengeState === 'lost' ? (
                <div className="build-end-banner" data-cursor-ignore="true">
                  Time up. Hit Reset and run it back.
                </div>
              ) : null}

              {showWinPopup ? (
                <div className="build-win-popup" data-cursor-ignore="true">
                  <div className="build-win-confetti" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <p className="build-win-title">Stack Master</p>
                  <p className="build-win-text">Cleared with {winTimeLeft}s left.</p>
                  {physicsMode === 'normal' ? (
                    <div className="build-win-cta-wrap">
                      <button
                        type="button"
                        className="build-tutorial-btn is-next"
                        onClick={() => {
                          setShowWinPopup(false);
                          switchMode('chaos');
                          resetPieces();
                          setChallengeState('running');
                          setTimeLeft(CHAOS_TIME_LIMIT);
                        }}
                        data-cursor-ignore="true"
                      >
                        Try Chaos Mode
                      </button>
                      <button
                        type="button"
                        className="build-tutorial-btn is-ghost"
                        onClick={() => setShowWinPopup(false)}
                        data-cursor-ignore="true"
                      >
                        Later
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="build-tutorial-btn is-next"
                      onClick={() => setShowWinPopup(false)}
                      data-cursor-ignore="true"
                    >
                      Nice
                    </button>
                  )}

                  {showUnlockHint ? (
                    <button
                      type="button"
                      className="build-unlock-cta"
                      onClick={() => {
                        setShowWinPopup(false);
                        setShowUnlockHint(false);
                        openArcade('stack-reactor');
                      }}
                      data-cursor-ignore="true"
                    >
                      {'You unlocked something. \u2192'}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
        <div className="contact-row">
          <a href={`mailto:${PERSONAL.email}`} className="contact-email-block">
            <span className="contact-email-label">Email</span>
            <span className="contact-email-value">{PERSONAL.email}</span>
          </a>
          <div className="contact-links-col">
            <a
              href={PERSONAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              LinkedIn <ArrowUpRight size={14} strokeWidth={1.5} />
            </a>
            <a
              href={PERSONAL.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              GitHub <ArrowUpRight size={14} strokeWidth={1.5} />
            </a>
            <span className="contact-link contact-location">
              {PERSONAL.location}
            </span>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

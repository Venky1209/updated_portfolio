'use client';

import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

/*
  DiveCanvas — Full-screen 2D canvas for the underwater dive sequence.
  Phases:
    0.0–0.3  transparent (hero GSAP handles the rush)
    0.3–0.8  underwater: ocean bg, caustic lights, speed lines, bubbles
    0.8–1.0  destination glow emerges ahead
*/

export interface DiveCanvasHandle {
  start: () => void;
  reset: () => void;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  wobble: number;
}

export const DiveCanvas = forwardRef<DiveCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const activeRef = useRef(false);
  const progressRef = useRef(0); // 0→1 over 1600ms
  const bubblesRef = useRef<Bubble[]>([]);

  useImperativeHandle(ref, () => ({
    start: () => {
      activeRef.current = true;
      progressRef.current = 0;
      const startTime = performance.now();

      const tick = (now: number) => {
        progressRef.current = Math.min(1, (now - startTime) / 1600);
        draw();
        if (progressRef.current < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          activeRef.current = false;
        }
      };
      animRef.current = requestAnimationFrame(tick);
    },
    reset: () => {
      activeRef.current = false;
      cancelAnimationFrame(animRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Pre-generate bubble pool
    bubblesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      r: Math.random() * 6 + 2,
      speed: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.2,
      wobble: Math.random() * Math.PI * 2,
    }));

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const p = progressRef.current;

    ctx.clearRect(0, 0, width, height);

    // ── PHASE 1 (0→0.3): Wave surge — handled by GSAP on hero, canvas transparent
    if (p < 0.3) return;

    // ── PHASE 2 (0.3→0.8): Underwater ──
    const underwaterP = Math.min(1, (p - 0.3) / 0.5);

    // Ocean background — deep dark blue
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, `rgba(0, 8, 30, ${underwaterP})`);
    bgGrad.addColorStop(1, `rgba(0, 3, 15, ${underwaterP})`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // ── CAUSTIC LIGHT PATTERNS ──
    const causticCount = 8;
    for (let i = 0; i < causticCount; i++) {
      const cx =
        (width / causticCount) * i +
        Math.sin(p * 12 + i * 0.8) * 40;
      const cy =
        height * 0.7 + Math.cos(p * 8 + i * 1.2) * 20;
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        80 + Math.sin(p * 10 + i) * 20
      );
      grad.addColorStop(
        0,
        `rgba(40, 120, 200, ${0.08 * underwaterP})`
      );
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        100,
        30,
        Math.sin(p * 5 + i) * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // ── SPEED LINES from center ──
    if (underwaterP > 0.1 && underwaterP < 0.9) {
      const lineCount = 24;
      const lineOpacity =
        Math.sin(underwaterP * Math.PI) * 0.15;
      ctx.strokeStyle = `rgba(100, 160, 255, ${lineOpacity})`;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const innerR = 60 + underwaterP * 200;
        const outerR = innerR + 80 + Math.random() * 60;
        ctx.beginPath();
        ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.moveTo(
          width / 2 + Math.cos(angle) * innerR,
          height / 2 + Math.sin(angle) * innerR
        );
        ctx.lineTo(
          width / 2 + Math.cos(angle) * outerR,
          height / 2 + Math.sin(angle) * outerR
        );
        ctx.stroke();
      }
    }

    // ── BUBBLES streaming upward ──
    const bubbleOpacity =
      Math.sin(underwaterP * Math.PI) * underwaterP;
    bubblesRef.current.forEach((b) => {
      b.y -= b.speed * (1 + underwaterP * 2);
      b.wobble += 0.05;
      b.x += Math.sin(b.wobble) * 0.5;

      // Reset bubble when it goes off top
      if (b.y < -20) {
        b.y = height + 10;
        b.x = Math.random() * width;
      }

      // Bubble outline
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(150, 200, 255, ${b.opacity * bubbleOpacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bubble highlight
      ctx.beginPath();
      ctx.arc(
        b.x - b.r * 0.3,
        b.y - b.r * 0.3,
        b.r * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * bubbleOpacity * 0.6})`;
      ctx.fill();
    });

    // ── PHASE 3 (0.8→1.0): Glow ahead — destination light ──
    if (p > 0.8) {
      const glowP = (p - 0.8) / 0.2;
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.4,
        0,
        width / 2,
        height * 0.4,
        300 + glowP * 200
      );
      glowGrad.addColorStop(
        0,
        `rgba(220, 240, 255, ${glowP * 0.6})`
      );
      glowGrad.addColorStop(
        0.4,
        `rgba(100, 180, 255, ${glowP * 0.2})`
      );
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
});

DiveCanvas.displayName = 'DiveCanvas';

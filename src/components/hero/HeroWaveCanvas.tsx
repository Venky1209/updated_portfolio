'use client';

import { useRef, useEffect } from 'react';
import { ARCADE_TEASE_EVENT } from '@/lib/arcadeNudge';

/*
  HeroWaveCanvas — Interstellar Miller's-planet-style ocean waves.
  Renders behind the hero name text on a <canvas>.
  3-layer sine wave system with lerped amplitude, foam crest, and TARS monolith.
  Waves react to cursor position (X → phase, Y → amplitude) and velocity.
*/

interface WaveState {
  cursorX: number;   // 0–1 normalized within name width
  cursorY: number;   // 0–1 normalized within name height
  velocity: number;  // cursor movement speed
  active: boolean;   // cursor inside name?
  surgeMult: number; // wave:surge multiplier (default 1)
  interactionStart: number | null; // timestamp of continuous interaction start
  nudgeFired: boolean; // true once arcade:tease has been dispatched
}

// ── HELPER: rounded rect (for browsers without ctx.roundRect) ──
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── HELPER: spray particles at foot contact point ──
const sprayParticles: Array<{
  x: number; y: number; vx: number; vy: number; life: number;
}> = [];

function drawSpray(
  ctx: CanvasRenderingContext2D,
  footX: number,
  footY: number,
  opacity: number,
  amplitude: number
) {
  // Spawn new particles when amplitude is high enough
  if (amplitude > 8 && Math.random() < 0.3) {
    sprayParticles.push({
      x: footX,
      y: footY,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(Math.random() * 2 + 0.5),
      life: 1.0,
    });
  }

  // Draw + age particles
  for (let i = sprayParticles.length - 1; i >= 0; i--) {
    const p = sprayParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08; // gravity
    p.life -= 0.05;

    if (p.life <= 0) {
      sprayParticles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${p.life * opacity * 0.8})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.life * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── TARS: movie-accurate two-leg geometric silhouette ──
function drawTARS(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tiltAngle: number,
  amplitude: number
) {
  if (amplitude < 3) return;

  const opacity = Math.min(1, amplitude / 30);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tiltAngle * Math.PI) / 180);

  // ── TARS GEOMETRY CONSTANTS ──
  const legW = 10;
  const legH = 44;
  const legGap = 12;
  const legRadius = 2;
  const inwardAngle = 6 * (Math.PI / 180);

  // Shadow beneath TARS (cast on water surface)
  ctx.save();
  ctx.scale(1, 0.15);
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(0, 2, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── LEFT LEG ──
  ctx.save();
  ctx.rotate(-inwardAngle);
  ctx.translate(-(legGap / 2 + legW / 2), -legH);

  ctx.fillStyle = `rgba(210, 210, 215, ${opacity})`;
  roundRect(ctx, -legW / 2, 0, legW, legH, legRadius);
  ctx.fill();

  // Inner panel line
  ctx.strokeStyle = `rgba(120, 120, 130, ${opacity * 0.6})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, legH - 4);
  ctx.stroke();

  ctx.restore();

  // ── RIGHT LEG ──
  ctx.save();
  ctx.rotate(inwardAngle);
  ctx.translate(legGap / 2 + legW / 2, -legH);

  ctx.fillStyle = `rgba(210, 210, 215, ${opacity})`;
  roundRect(ctx, -legW / 2, 0, legW, legH, legRadius);
  ctx.fill();

  // Inner panel line
  ctx.strokeStyle = `rgba(120, 120, 130, ${opacity * 0.6})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, legH - 4);
  ctx.stroke();

  ctx.restore();

  // ── CROSSBAR (top connector) ──
  ctx.fillStyle = `rgba(200, 200, 205, ${opacity * 0.5})`;
  roundRect(ctx, -16, -legH - 1, 32, 2, 1);
  ctx.fill();

  // ── SPRAY PARTICLES at waterline ──
  drawSpray(ctx, -(legGap / 2 + legW / 2), 0, opacity, amplitude);
  drawSpray(ctx, legGap / 2 + legW / 2, 0, opacity, amplitude);

  ctx.restore();
}

export default function HeroWaveCanvas({
  nameRef,
}: {
  nameRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<WaveState>({
    cursorX: 0.5,
    cursorY: 0.5,
    velocity: 0,
    active: false,
    surgeMult: 1,
    interactionStart: null,
    nudgeFired: false,
  });
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    const canvas = canvasRef.current;
    const name = nameRef.current;
    const interactionTarget = name?.parentElement;
    if (!canvas || !name || !interactionTarget) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wave parameters — 3 layers
    const waves = [
      {
        amplitude: 0,
        targetAmplitude: 0,
        frequency: 0.012,
        speed: 0.6,
        phase: 0,
        opacity: 0.9,
      },
      {
        amplitude: 0,
        targetAmplitude: 0,
        frequency: 0.02,
        speed: 1.1,
        phase: Math.PI * 0.7,
        opacity: 0.5,
      },
      {
        amplitude: 0,
        targetAmplitude: 0,
        frequency: 0.008,
        speed: 0.4,
        phase: Math.PI * 1.3,
        opacity: 0.3,
      },
    ];

    let time = 0;
    let lastX = 0;
    let tarsAngle = 0;
    let passiveNudgeTimeout: number | null = null;
    let renderWidth = 0;
    let renderHeight = 0;

    const getWaveY = (
      x: number,
      wave: (typeof waves)[0],
      t: number,
      phaseOffset: number
    ): number => {
      return (
        wave.amplitude *
        Math.sin(wave.frequency * x + t * wave.speed + wave.phase + phaseOffset)
      );
    };

    const dispatchArcadeTease = () => {
      if (stateRef.current.nudgeFired) return;

      window.dispatchEvent(new Event(ARCADE_TEASE_EVENT));
      stateRef.current.nudgeFired = true;
    };

    const draw = () => {
      if (renderWidth === 0 || renderHeight === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const state = stateRef.current;
      ctx.clearRect(0, 0, renderWidth, renderHeight);

      // Phase offset driven by cursor X
      const phaseOffset = (state.cursorX - 0.5) * Math.PI * 3;

      // Target amplitude: cursor Y drives height, velocity adds drama
      const baseAmp = state.active
        ? renderHeight * (0.15 + state.cursorY * 0.25)
        : 0;

      waves.forEach((wave, i) => {
        wave.targetAmplitude = state.active
          ? (baseAmp * state.surgeMult * (1 - i * 0.2) + state.velocity * 20)
          : 0;
        // Smooth lerp toward target
        wave.amplitude +=
          (wave.targetAmplitude - wave.amplitude) * 0.04;

        // Draw wave fill
        ctx.beginPath();
        ctx.moveTo(0, renderHeight);

        for (let x = 0; x <= renderWidth; x += 2) {
          const y = renderHeight * 0.6 - getWaveY(x, wave, time, phaseOffset);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(renderWidth, renderHeight);
        ctx.closePath();

        // Wave fill: dark ocean gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, renderHeight);
        gradient.addColorStop(
          0,
          `rgba(10, 20, 50, ${wave.opacity})`
        );
        gradient.addColorStop(
          1,
          `rgba(5, 10, 30, ${wave.opacity * 0.3})`
        );
        ctx.fillStyle = gradient;
        ctx.fill();

        // Foam crest line — only on the front wave
        if (i === 0) {
          ctx.beginPath();
          for (let x = 0; x <= renderWidth; x += 2) {
            const y =
              renderHeight * 0.6 - getWaveY(x, wave, time, phaseOffset);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${state.active ? 0.7 : 0
            })`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // TARS — movie-accurate two-leg silhouette on wave crest
      if (state.active && waves[0].amplitude > 2) {
        const tarsX = state.cursorX * renderWidth;
        const waveY =
          renderHeight * 0.6 -
          getWaveY(tarsX, waves[0], time, phaseOffset);

        // Wave slope → tilt angle
        const dx = 4;
        const y1 =
          renderHeight * 0.6 -
          getWaveY(tarsX - dx, waves[0], time, phaseOffset);
        const y2 =
          renderHeight * 0.6 -
          getWaveY(tarsX + dx, waves[0], time, phaseOffset);
        const rawAngle =
          Math.atan2(y2 - y1, dx * 2) * (180 / Math.PI);
        tarsAngle += (rawAngle - tarsAngle) * 0.08;

        drawTARS(ctx, tarsX, waveY, tarsAngle, waves[0].amplitude);
      }

      // Decay velocity naturally
      stateRef.current.velocity *= 0.95;

      time += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    // Resize canvas to match name element dimensions
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      renderWidth = canvas.offsetWidth;
      renderHeight = canvas.offsetHeight;

      if (renderWidth === 0 || renderHeight === 0) return;

      canvas.width = Math.floor(renderWidth * dpr);
      canvas.height = Math.floor(renderHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking on the name element
    const onEnter = () => {
      stateRef.current.active = true;

      if (passiveNudgeTimeout !== null) {
        window.clearTimeout(passiveNudgeTimeout);
      }
      passiveNudgeTimeout = window.setTimeout(() => {
        if (
          stateRef.current.active &&
          !stateRef.current.nudgeFired
        ) {
          dispatchArcadeTease();
        }
      }, 3000);
    };
    const onLeave = () => {
      stateRef.current.active = false;
      stateRef.current.velocity = 0;
      stateRef.current.interactionStart = null;
      stateRef.current.nudgeFired = false;

      if (passiveNudgeTimeout !== null) {
        window.clearTimeout(passiveNudgeTimeout);
        passiveNudgeTimeout = null;
      }
    };
    const onMove = (e: MouseEvent) => {
      const rect = interactionTarget.getBoundingClientRect();
      const newX = (e.clientX - rect.left) / rect.width;
      stateRef.current.velocity = Math.abs(newX - lastX) * 10;
      lastX = newX;
      stateRef.current.cursorX = Math.max(0, Math.min(1, newX));
      stateRef.current.cursorY = Math.max(
        0,
        Math.min(1, (e.clientY - rect.top) / rect.height)
      );

      // Arcade nudge — fire after 5s of continuous interaction
      if (stateRef.current.interactionStart === null) {
        stateRef.current.interactionStart = Date.now();
      }
      if (
        !stateRef.current.nudgeFired &&
        Date.now() - (stateRef.current.interactionStart ?? 0) > 5000
      ) {
        dispatchArcadeTease();
      }
    };

    interactionTarget.addEventListener('mouseenter', onEnter);
    interactionTarget.addEventListener('mouseleave', onLeave);
    interactionTarget.addEventListener('mousemove', onMove);

    // Wave surge event — dive transition triggers this
    const onSurge = () => {
      stateRef.current.surgeMult = 4;
      setTimeout(() => {
        stateRef.current.surgeMult = 1;
      }, 600);
    };
    window.addEventListener('wave:surge', onSurge);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wave:surge', onSurge);
      interactionTarget.removeEventListener('mouseenter', onEnter);
      interactionTarget.removeEventListener('mouseleave', onLeave);
      interactionTarget.removeEventListener('mousemove', onMove);
      if (passiveNudgeTimeout !== null) {
        window.clearTimeout(passiveNudgeTimeout);
      }
    };
  }, [nameRef]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-wave-canvas"
      aria-hidden="true"
    />
  );
}

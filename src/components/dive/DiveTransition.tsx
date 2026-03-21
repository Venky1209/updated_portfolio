'use client';

import { useEffect, useRef } from 'react';
import { DiveCanvas, DiveCanvasHandle } from './DiveCanvas';
import gsap from 'gsap';
import '@/styles/dive.css';

/*
  DiveTransition — Orchestrator for the cinematic dive.
  Listens for dive:start / dive:end CustomEvents.
  Phase 1 (0–0.3s): Hero rushes toward camera (scale + blur), wave surges.
  Phase 2 (0.3–1.4s): Canvas underwater sequence.
  Phase 3 (1.4–1.6s): Clip-path wipe reveals destination section.
*/

interface LenisInstance {
  stop: () => void;
  start: () => void;
}

function getLenis(): LenisInstance | null {
  return (
    (window as unknown as { __lenis?: LenisInstance }).__lenis ?? null
  );
}

export default function DiveTransition() {
  const canvasRef = useRef<DiveCanvasHandle>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onStart = () => {
      // Pause Lenis scroll during dive
      getLenis()?.stop();

      const tl = gsap.timeline();

      // Wave amplitude boost — dispatch to HeroWaveCanvas
      window.dispatchEvent(new CustomEvent('wave:surge'));

      // ── PHASE 1 (0–0.3s): Hero rushes toward camera ──
      tl.to(
        '#hero',
        {
          scale: 1.8,
          filter: 'blur(8px)',
          duration: 0.45,
          ease: 'power3.in',
        },
        0.05
      );

      tl.to(
        '#hero',
        {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in',
        },
        0.3
      );

      // ── PHASE 2 (0.3s): Canvas takes over ──
      tl.call(
        () => {
          canvasRef.current?.start();
        },
        [],
        0.3
      );

      // ── PHASE 3 (1.4s): Surface wipe ──
      tl.set(
        overlayRef.current,
        {
          clipPath: 'inset(100% 0 0 0)',
          opacity: 1,
          display: 'block',
        },
        1.4
      );

      tl.to(
        overlayRef.current,
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.2,
          ease: 'power2.inOut',
        },
        1.4
      );
    };

    const onEnd = () => {
      // Reset hero for when user scrolls back
      gsap.set('#hero', {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
      });

      canvasRef.current?.reset();

      // Hide overlay
      gsap.set(overlayRef.current, {
        display: 'none',
        opacity: 0,
      });

      // Re-enable Lenis
      getLenis()?.start();
    };

    window.addEventListener('dive:start', onStart);
    window.addEventListener('dive:end', onEnd);
    return () => {
      window.removeEventListener('dive:start', onStart);
      window.removeEventListener('dive:end', onEnd);
    };
  }, []);

  return (
    <>
      <DiveCanvas ref={canvasRef} />

      {/* Surface wipe overlay — solid color, clips up to reveal section */}
      <div
        ref={overlayRef}
        className="dive-surface-overlay"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg)',
          zIndex: 9999,
          display: 'none',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

/*
  CursorManager — Apple-tier custom cursor with multiple states:
    DEFAULT:     8px filled accent circle
    HOVER_LINK:  48px hollow ring + "VIEW" text inside
    HOVER_PROJ:  80px ring + project number inside, slow rotation
    CLICK:       Squish (scaleX:1.4, scaleY:0.6) then spring back
    SECTION:     Color shifts to match current section accent
*/

const SECTION_ACCENTS: Record<string, string> = {
  hero: 'var(--accent)',
  about: 'var(--accent)',
  experience: 'var(--accent)',
  projects: '#c8ff00',
  skills: '#00d4ff',
  achievements: '#ff6b35',
  contact: '#a855f7',
};

export default function CursorManager() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<string | null>(null);
  const stateRef = useRef('DEFAULT');

  const resetCursor = useCallback(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const text = textRef.current;
    if (!dot || !ring || !text) return;

    stateRef.current = 'DEFAULT';
    gsap.to(dot, { width: 8, height: 8, opacity: 1, duration: 0.25, ease: 'power2.out' });
    gsap.to(ring, { width: 0, height: 0, opacity: 0, borderWidth: 1, rotation: 0, duration: 0.25, ease: 'power2.out' });
    gsap.to(text, { opacity: 0, duration: 0.15 });
    text.textContent = '';
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const text = textRef.current;
    if (!dot || !ring || !text) return;

    // Touch device → bail
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 1)) {
      dot.style.display = 'none';
      ring.style.display = 'none';
      text.style.display = 'none';
      return;
    }

    // Hide default cursor sitewide
    document.documentElement.classList.add('cm-active');

    // ── Mouse move ──
    const onMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(text, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });

      // Section detection for color shift
      const target = (e.target as HTMLElement)?.closest?.('section[id]');
      const sectionId = target?.id || null;
      if (sectionId !== activeSectionRef.current) {
        activeSectionRef.current = sectionId;
        const color = (sectionId && SECTION_ACCENTS[sectionId]) || 'var(--accent)';
        gsap.to(dot, { backgroundColor: color, duration: 0.4 });
        gsap.to(ring, { borderColor: color, duration: 0.4 });
        gsap.to(text, { color: color, duration: 0.4 });
      }
    };

    // ── Click squish ──
    const onDown = () => {
      gsap.to(dot, { scaleX: 1.4, scaleY: 0.6, duration: 0.1, ease: 'power2.out' });
    };
    const onUp = () => {
      gsap.to(dot, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    };

    // ── Hover handlers (delegated) ──
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;

      // Opt-out zone for interactive mini-games where the cursor ring is distracting.
      const ignoreCursorZone = el.closest?.('[data-cursor-ignore]') as HTMLElement | null;
      if (ignoreCursorZone) {
        resetCursor();
        return;
      }

      // Wave zone hover (hero name) — 100px hollow ring, no text
      const waveZone = el.closest?.('[data-cursor-wave]') as HTMLElement | null;
      if (waveZone) {
        stateRef.current = 'HOVER_WAVE';
        gsap.to(dot, { width: 4, height: 4, opacity: 0.2, duration: 0.3, ease: 'power2.out' });
        gsap.to(ring, { width: 100, height: 100, opacity: 1, borderWidth: 2, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
        text.textContent = '';
        gsap.to(text, { opacity: 0, duration: 0.15 });
        return;
      }

      // Project row hover
      const projRow = el.closest?.('.project-row, [data-cursor-project]') as HTMLElement | null;
      if (projRow) {
        const idx = projRow.dataset.cursorProject || projRow.querySelector('.project-index')?.textContent || '?';
        stateRef.current = 'HOVER_PROJ';
        gsap.to(dot, { width: 6, height: 6, opacity: 0.4, duration: 0.3, ease: 'power2.out' });
        gsap.to(ring, { width: 80, height: 80, opacity: 1, borderWidth: 1.5, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
        text.textContent = idx;
        gsap.to(text, { opacity: 1, duration: 0.2 });
        return;
      }

      // Any link/button hover
      const link = el.closest?.('a, button:not([data-cursor-ignore]), [data-cursor-hover]') as HTMLElement | null;
      if (link) {
        stateRef.current = 'HOVER_LINK';
        const label = link.dataset.cursorLabel || 'VIEW';
        gsap.to(dot, { width: 4, height: 4, opacity: 0.3, duration: 0.25, ease: 'power2.out' });
        gsap.to(ring, { width: 48, height: 48, opacity: 1, borderWidth: 1.5, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
        text.textContent = label;
        gsap.to(text, { opacity: 1, duration: 0.2 });
        return;
      }
    };

    const onOut = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const leaving = el.closest?.('a, button:not([data-cursor-ignore]), [data-cursor-hover], .project-row, [data-cursor-project], [data-cursor-wave]');
      if (leaving) {
        resetCursor();
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.documentElement.classList.remove('cm-active');
    };
  }, [resetCursor]);

  return (
    <>
      <div ref={dotRef} className="cm-dot" aria-hidden="true" />
      <div ref={ringRef} className="cm-ring" aria-hidden="true" />
      <div ref={textRef} className="cm-text" aria-hidden="true" />
    </>
  );
}

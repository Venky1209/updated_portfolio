'use client';

import { useRef, useCallback } from 'react';
import gsap from 'gsap';

export type DiveTarget =
  | 'projects'
  | 'about'
  | 'skills'
  | 'achievements'
  | 'contact';

interface LenisInstance {
  stop: () => void;
  start: () => void;
  scrollTo: (
    target: HTMLElement | number,
    opts?: { immediate?: boolean }
  ) => void;
}

function getLenis(): LenisInstance | null {
  return (
    (window as unknown as { __lenis?: LenisInstance }).__lenis ?? null
  );
}

export function useDive() {
  const isDiving = useRef(false);

  const dive = useCallback((target: DiveTarget) => {
    if (isDiving.current) return;
    isDiving.current = true;

    // Mobile fallback — simple opacity fade, no canvas
    if (window.innerWidth < 768) {
      gsap.to('body', {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView();
          gsap.to('body', {
            opacity: 1,
            duration: 0.3,
            onComplete: () => {
              isDiving.current = false;
            },
          });
        },
      });
      return;
    }

    // Dispatch so DiveTransition knows to start
    window.dispatchEvent(
      new CustomEvent('dive:start', { detail: { target } })
    );

    // After animation completes, scroll to target + re-enable scroll
    setTimeout(() => {
      const el = document.getElementById(target);
      const lenis = getLenis();
      if (el && lenis) {
        lenis.scrollTo(el, { immediate: true });
      } else if (el) {
        el.scrollIntoView();
      }
      window.dispatchEvent(new CustomEvent('dive:end'));
      isDiving.current = false;
    }, 1600);
  }, []);

  return { dive };
}

'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

declare global {
  interface Window {
    __lenis: Lenis | null;
  }
}

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 1;
    const isSmallScreen = window.innerWidth < 900;

    // Skip Lenis on touch/small devices or reduced motion
    if (prefersReduced || isTouch || isSmallScreen) {
      document.documentElement.style.scrollBehavior = 'smooth';
      // Still refresh ScrollTrigger for native-scroll animations
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 0.95,
      easing: (t: number) => 1 - Math.pow(1 - t, 2.6),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    const resize = () => lenis.resize();
    lenis.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener('refresh', resize);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      ScrollTrigger.removeEventListener('refresh', resize);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return lenisRef;
}

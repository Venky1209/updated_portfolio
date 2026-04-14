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
    // TASK 4: Disable Lenis on touch/mobile devices
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 900;

    // Skip Lenis on touch/small devices or reduced motion
    if (prefersReduced || isTouchDevice || isSmallScreen) {
      // Still refresh ScrollTrigger for native-scroll animations
      ScrollTrigger.refresh();
      return;
    }

    // TASK 2: Updated Lenis config
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    const resize = () => lenis.resize();

    // TASK 3: Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time: number) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.addEventListener('refresh', resize);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback);
      ScrollTrigger.removeEventListener('refresh', resize);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return lenisRef;
}

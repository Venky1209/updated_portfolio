'use client';

import { useRef, useEffect, useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { PERSONAL } from '@/data/portfolio';
import LiveClock from '@/components/hero/LiveClock';
import HeroWaveCanvas from '@/components/hero/HeroWaveCanvas';
import { useDive } from '@/components/dive/useDive';
import { useArcade } from '@/components/Arcade/ArcadeContext';
import gsap from 'gsap';

interface LenisInstance {
  on: (event: string, callback: (e: { velocity: number }) => void) => void;
  off: (event: string, callback: (e: { velocity: number }) => void) => void;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const { dive } = useDive();
  const { openArcade } = useArcade();
  const [showHint, setShowHint] = useState(false);

  /* Entrance animation */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.4, defaults: { ease: 'power4.out' } });

      tl.from(nameRef.current, {
        yPercent: 100,
        opacity: 0,
        duration: 1.2,
      })
        .from(
          metaRef.current,
          { opacity: 0, y: 20, duration: 0.8 },
          '-=0.4'
        )
        .from(
          ctaRef.current,
          { opacity: 0, scale: 0.8, duration: 0.6 },
          '-=0.3'
        )
        .from(
          scrollRef.current,
          { opacity: 0, x: -10, duration: 0.6 },
          '-=0.3'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* One-time arcade hint — sessionStorage gated */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;
    if (sessionStorage.getItem('hint-shown')) return;

    const showTimer = setTimeout(() => {
      setShowHint(true);
      sessionStorage.setItem('hint-shown', 'true');
    }, 2000);

    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, 7000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  /* Addition 4 — Scroll velocity distortion on hero name */
  useEffect(() => {
    const name = nameRef.current;
    if (!name) return;

    const onScroll = (e: { velocity: number }) => {
      const stretch = Math.min(Math.abs(e.velocity) * 0.08, 0.4);
      if (stretch < 0.02) return; // ignore tiny movements

      gsap.to(name, {
        scaleY: 1 + stretch,
        duration: 0.1,
        ease: 'none',
        overwrite: true,
      });
      gsap.to(name, {
        scaleY: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.1,
      });
    };

    // Wait for Lenis to be available
    const timer = setTimeout(() => {
      const lenis = (window as unknown as Record<string, unknown>).__lenis as LenisInstance | null;
      if (lenis) lenis.on('scroll', onScroll);
    }, 500);

    return () => {
      clearTimeout(timer);
      const lenis = (window as unknown as Record<string, unknown>).__lenis as LenisInstance | null;
      if (lenis) lenis.off('scroll', onScroll);
    };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="hero-section">
      {/* Top-left meta label */}
      <div ref={metaRef} className="hero-meta">
        <span className="hero-meta-label">Portfolio / 2025</span>
        <span className="hero-meta-label">{PERSONAL.location}</span>
      </div>

      {/* Edge-to-edge display name with wave canvas */}
      <div className="hero-name-wrapper" data-cursor-wave>
        <div className="hero-wave-canvas-wrap">
          <HeroWaveCanvas nameRef={nameRef} />
        </div>
        <h1 ref={nameRef} className="hero-name">
          {PERSONAL.name}
          <span className="hero-accent-dot">.</span>
        </h1>
      </div>

      {/* Live clock + location line */}
      <LiveClock />

      {/* Tagline + roles as flat text */}
      <div className="hero-bottom-bar">
        <div className="hero-bottom-left">
          <span ref={scrollRef} className="hero-scroll-label">Scroll</span>
          {showHint && (
            <span className="hero-arcade-hint">↓ scroll to unlock arcade</span>
          )}
        </div>

        <div className="hero-bottom-center">
          <p className="hero-tagline">{PERSONAL.tagline}</p>
          <div className="hero-roles">
            {PERSONAL.roles.map((role, i) => (
              <span key={role} className="hero-role-tag">
                {i > 0 && <span className="hero-role-divider">/</span>}
                {role}
              </span>
            ))}
            <span 
              className="hero-role-tag hero-arcade-trigger" 
              onClick={() => openArcade()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openArcade();
              }}
            >
              <span className="hero-role-divider">/</span>
              ↳ ARCADE MODE
            </span>
          </div>
        </div>

        <a
          ref={ctaRef}
          href="#about"
          className="hero-cta"
          aria-label="Dive into my work"
          onClick={(e) => {
            e.preventDefault();
            dive('about');
          }}
        >
          <ArrowDownRight size={28} strokeWidth={1.5} />
        </a>
      </div>
    </section>
  );
}


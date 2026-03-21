'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { PERSONAL } from '@/data/portfolio';

export default function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const curtainTopRef = useRef<HTMLDivElement>(null);
  const curtainBotRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [showSkip, setShowSkip] = useState(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Show skip button after 1s
    const skipTimer = setTimeout(() => setShowSkip(true), 1000);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: finish,
      });

      // Phase 1 (0–0.6s): Name appears letter by letter
      const chars = nameRef.current?.querySelectorAll('.intro-char');
      if (chars && chars.length > 0) {
        tl.fromTo(
          chars,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.04,
            duration: 0.3,
            ease: 'power2.out',
          },
          0
        );
      }

      // Phase 2 (0.6–1.4s): Name scales up + fades, role fades in
      tl.to(nameRef.current, {
        scale: 1.05,
        opacity: 0.6,
        duration: 0.4,
        ease: 'power2.inOut',
      }, 0.6);

      tl.fromTo(
        roleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0.8
      );

      // Phase 3 (1.4–2.2s): Curtain wipe reveals hero
      tl.to(curtainTopRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut',
      }, 1.4);

      tl.to(curtainBotRef.current, {
        yPercent: 100,
        duration: 0.8,
        ease: 'power3.inOut',
      }, 1.4);

      // Fade out overlay
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, 2.0);
    }, overlayRef);

    return () => {
      clearTimeout(skipTimer);
      ctx.revert();
    };
  }, [finish]);

  // Split name into characters
  const nameChars = PERSONAL.name.split('').map((char, i) => (
    <span key={i} className="intro-char" style={{ display: char === ' ' ? 'inline' : 'inline-block' }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div ref={overlayRef} className="intro-overlay">
      <div className="intro-content">
        <div ref={nameRef} className="intro-name">
          {nameChars}
        </div>
        <div ref={roleRef} className="intro-role" style={{ opacity: 0 }}>
          {PERSONAL.tagline}
        </div>
      </div>

      {/* Curtain panels */}
      <div ref={curtainTopRef} className="intro-curtain intro-curtain-top" />
      <div ref={curtainBotRef} className="intro-curtain intro-curtain-bot" />

      {/* Skip button */}
      {showSkip && (
        <button
          className="intro-skip"
          onClick={(e) => { e.stopPropagation(); finish(); }}
        >
          SKIP ↓
        </button>
      )}
    </div>
  );
}

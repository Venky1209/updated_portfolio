'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useArcade } from '@/components/Arcade/ArcadeContext';

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const { openArcade } = useArcade();
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const seen = typeof window !== 'undefined' ? localStorage.getItem('arcade_seen') : 'true';
    setShowPulse(seen !== 'true');
  }, []);

  // Hide on mount, show after scrolling 50vh past hero top
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Start hidden
    gsap.set(nav, { autoAlpha: 0, y: -20, pointerEvents: 'none' });

    const st = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: () => `+=${window.innerHeight * 0.5}`,
      onLeave: () => {
        gsap.to(nav, { autoAlpha: 1, y: 0, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
      },
      onEnterBack: () => {
        gsap.to(nav, { autoAlpha: 0, y: -20, pointerEvents: 'none', duration: 0.3, ease: 'power2.in' });
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <nav ref={navRef} className="navbar">
      <a href="#hero" className="nav-logo">
        VK<span className="nav-logo-dot">.</span>
      </a>

      <div className="nav-actions">
        <button
          type="button"
          className={`nav-arcade-btn ${showPulse ? 'is-pulse' : ''}`}
          onClick={() => {
            openArcade();
            setShowPulse(false);
            if (typeof window !== 'undefined') {
              localStorage.setItem('arcade_seen', 'true');
            }
          }}
          data-cursor-label="PLAY"
        >
          Arcade
        </button>
      </div>
    </nav>
  );
}

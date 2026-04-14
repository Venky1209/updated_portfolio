'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useArcade } from '@/components/Arcade/ArcadeContext';
import { ARCADE_TEASE_EVENT } from '@/lib/arcadeNudge';

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const arcadeBtnRef = useRef<HTMLButtonElement>(null);
  const { openArcade } = useArcade();
  const [arcadeUnlocked, setArcadeUnlocked] = useState(false);
  const [showPing, setShowPing] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [showTeaseTooltip, setShowTeaseTooltip] = useState(false);
  const [isTeaseTooltipVisible, setIsTeaseTooltipVisible] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Listen for arcade:tease from HeroWaveCanvas interaction timer
  useEffect(() => {
    let removeGlitchTimeout: number | null = null;
    let tooltipStartTimeout: number | null = null;
    let tooltipFadeInTimeout: number | null = null;
    let tooltipAutoHideTimeout: number | null = null;
    let tooltipUnmountTimeout: number | null = null;

    const clearNudgeTimers = () => {
      if (removeGlitchTimeout !== null) {
        window.clearTimeout(removeGlitchTimeout);
      }
      if (tooltipStartTimeout !== null) {
        window.clearTimeout(tooltipStartTimeout);
      }
      if (tooltipFadeInTimeout !== null) {
        window.clearTimeout(tooltipFadeInTimeout);
      }
      if (tooltipAutoHideTimeout !== null) {
        window.clearTimeout(tooltipAutoHideTimeout);
      }
      if (tooltipUnmountTimeout !== null) {
        window.clearTimeout(tooltipUnmountTimeout);
      }
    };

    const hideTooltip = () => {
      setIsTeaseTooltipVisible(false);
      window.removeEventListener('click', hideTooltip);

      if (tooltipUnmountTimeout !== null) {
        window.clearTimeout(tooltipUnmountTimeout);
      }
      tooltipUnmountTimeout = window.setTimeout(() => {
        setShowTeaseTooltip(false);
      }, 200);
    };

    const triggerArcadeGlitch = () => {
      const nav = navRef.current;
      const btn = arcadeBtnRef.current;
      if (!nav || !btn) return;

      setArcadeUnlocked(true);
      setShowPing(false);

      // Ensure the nudge is visible even if navbar is still hidden at hero top.
      gsap.to(nav, {
        autoAlpha: 1,
        y: 0,
        pointerEvents: 'auto',
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      btn.classList.add('arcade-glitch');
      removeGlitchTimeout = window.setTimeout(() => {
        btn.classList.remove('arcade-glitch');
      }, 2000);

      tooltipStartTimeout = window.setTimeout(() => {
        setShowTeaseTooltip(true);
        tooltipFadeInTimeout = window.setTimeout(() => {
          setIsTeaseTooltipVisible(true);
        }, 20);

        window.addEventListener('click', hideTooltip);
        tooltipAutoHideTimeout = window.setTimeout(() => {
          hideTooltip();
        }, 5000);
      }, 800);
    };

    window.addEventListener(ARCADE_TEASE_EVENT, triggerArcadeGlitch);
    return () => {
      window.removeEventListener(ARCADE_TEASE_EVENT, triggerArcadeGlitch);
      window.removeEventListener('click', hideTooltip);
      clearNudgeTimers();
      setShowTeaseTooltip(false);
      setIsTeaseTooltipVisible(false);
    };
  }, []);

  // Unlock arcade at 40% scroll
  useEffect(() => {
    if (isTouchDevice) return;

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.4) {
        setArcadeUnlocked(true);
        setShowPing(false);
        // Bounce animation on unlock
        const btn = arcadeBtnRef.current;
        if (btn) {
          gsap.fromTo(btn,
            { scale: 1 },
            { scale: 1.2, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }
          );
        }
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTouchDevice]);

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

      <div className="nav-actions" style={{ position: 'relative' }}>
        {!isTouchDevice && (
          <>
            <button
              ref={arcadeBtnRef}
              type="button"
              className={`nav-arcade-btn ${arcadeUnlocked ? '' : 'is-locked'}`}
              onClick={() => {
                if (!arcadeUnlocked) return;
                openArcade();
              }}
              data-cursor-label="PLAY"
              aria-disabled={!arcadeUnlocked}
            >
              Arcade
              {showPing && !arcadeUnlocked && (
                <span className="arcade-ping-dot" />
              )}
            </button>
            {showTeaseTooltip && (
              <div
                className={`arcade-tooltip arcade-tease-tooltip ${isTeaseTooltipVisible ? 'is-visible' : ''}`}
              >
                You look like you&apos;re having fun. Try the Arcade. →
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

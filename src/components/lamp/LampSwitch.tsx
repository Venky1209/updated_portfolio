'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

interface LampSwitchProps {
  onToggle: () => void;
  theme: 'dark' | 'light';
}

export default function LampSwitch({ onToggle, theme }: LampSwitchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stringRef = useRef<SVGPathElement>(null);
  const pullRef = useRef<SVGCircleElement>(null);
  const isAnimating = useRef(false);

  const handlePull = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const string = stringRef.current;
    const pull = pullRef.current;

    if (!string || !pull) {
      isAnimating.current = false;
      return;
    }

    // Pull down animation
    const tl = gsap.timeline({
      onComplete: () => {
        onToggle();
        isAnimating.current = false;
      },
    });

    tl.to(pull, {
      cy: 130,
      duration: 0.2,
      ease: 'power2.in',
    })
      .to(
        string,
        {
          attr: { d: 'M12 0 Q12 65 12 130' },
          duration: 0.2,
          ease: 'power2.in',
        },
        '<'
      )
      .to(pull, {
        cy: 90,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.3)',
      })
      .to(
        string,
        {
          attr: { d: 'M12 0 Q12 45 12 90' },
          duration: 0.6,
          ease: 'elastic.out(1.2, 0.3)',
        },
        '<'
      );
  }, [onToggle]);

  // Idle sway
  useEffect(() => {
    const pull = pullRef.current;
    if (!pull) return;

    const ctx = gsap.context(() => {
      gsap.to(pull, {
        cx: 13.5,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="lamp-container" ref={containerRef}>
      {/* Lamp housing */}
      <svg
        width="24"
        height="20"
        viewBox="0 0 24 20"
        fill="none"
        style={{ marginBottom: '-1px' }}
      >
        <path
          d="M4 0 H20 L18 16 H6 Z"
          fill={theme === 'light' ? 'var(--accent)' : '#222'}
          stroke="var(--border)"
          strokeWidth="0.5"
        />
        {theme === 'light' && (
          <circle
            cx="12"
            cy="18"
            r="3"
            fill="var(--accent)"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.2;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>

      {/* Pull string */}
      <svg
        className="lamp-string"
        width="24"
        height="100"
        viewBox="0 0 24 100"
        onClick={handlePull}
        role="button"
        aria-label="Toggle theme"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePull();
          }
        }}
      >
        <path
          ref={stringRef}
          d="M12 0 Q12 45 12 90"
          stroke={theme === 'light' ? '#333' : '#555'}
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          ref={pullRef}
          cx="12"
          cy="90"
          r="5"
          fill={theme === 'light' ? 'var(--accent)' : '#444'}
          stroke={theme === 'light' ? '#333' : '#555'}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

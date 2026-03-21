'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function ScrollProgressLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Horizontal bar at top
        gsap.to(fillRef.current, {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        });

        gsap.to(dotRef.current, {
          left: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        });
      } else {
        // Vertical bar on left
        gsap.to(fillRef.current, {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        });

        gsap.to(dotRef.current, {
          top: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        });
      }

      // Hue shift across scroll
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const hue = 75 + self.progress * 200;
          if (fillRef.current) {
            fillRef.current.style.background = `hsl(${hue}, 100%, 50%)`;
          }
          if (dotRef.current) {
            dotRef.current.style.background = `hsl(${hue}, 100%, 50%)`;
            dotRef.current.style.boxShadow = `0 0 8px hsla(${hue}, 100%, 50%, 0.6)`;
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="scroll-progress-container">
      <div className="scroll-progress-track">
        <div ref={fillRef} className="scroll-progress-fill" style={{ height: 0 }} />
        <div ref={dotRef} className="scroll-progress-dot" style={{ top: 0 }} />
      </div>
    </div>
  );
}

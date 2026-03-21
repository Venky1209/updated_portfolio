'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

/*
  ChapterNav — Fixed right-side chapter indicator.
  Label appears LEFT of dot on hover only.
  Active dot expands to a line. Click scrolls via Lenis.
*/

const CHAPTERS = [
  { id: 'hero', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'experience', label: 'WORK' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'skills', label: 'CAPABILITIES' },
  { id: 'achievements', label: 'RECOGNITION' },
  { id: 'contact', label: 'CONTACT' },
] as const;

function ChapterDot({
  chapter,
  isActive,
  onClick,
}: {
  chapter: (typeof CHAPTERS)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="ch-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Go to ${chapter.label}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      data-cursor-label={chapter.label}
    >
      {/* Label — LEFT of dot */}
      <span
        className="ch-label"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(8px)',
        }}
      >
        {chapter.label}
      </span>

      {/* Dot */}
      <span
        className={`ch-dot ${isActive ? 'ch-dot--active' : ''}`}
      />
    </div>
  );
}

export default function ChapterNav() {
  const [active, setActive] = useState(0);

  // Track active section via ScrollTrigger
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    CHAPTERS.forEach((ch, i) => {
      const el = document.getElementById(ch.id);
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      });

      triggers.push(st);
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const lenis = (window as unknown as { __lenis?: { scrollTo: (el: HTMLElement, opts: Record<string, unknown>) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="ch-nav" aria-label="Chapter navigation">
      {CHAPTERS.map((ch, i) => (
        <ChapterDot
          key={ch.id}
          chapter={ch}
          isActive={i === active}
          onClick={() => scrollTo(ch.id)}
        />
      ))}
    </nav>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface SectionRevealProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export default function SectionReveal({ children, id, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Clip-path horizontal wipe reveal
      gsap.fromTo(
        el,
        {
          clipPath: 'inset(0 100% 0 0)',
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{ willChange: 'clip-path' }}
    >
      {children}
    </section>
  );
}

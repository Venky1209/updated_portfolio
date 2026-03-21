'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('vk-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Get lamp position for radial origin
    const lamp = document.querySelector('.lamp-container') as HTMLElement | null;
    const rect = lamp?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height : 0;

    // Calculate max radius needed to cover the full viewport
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Use View Transitions API if available
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) {
      doc.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('vk-theme', nextTheme);
        setTheme(nextTheme);
      });

      // Apply radial clip-path animation via CSS
      document.documentElement.style.setProperty('--lamp-x', `${x}px`);
      document.documentElement.style.setProperty('--lamp-y', `${y}px`);
      document.documentElement.style.setProperty('--lamp-r', `${maxR}px`);
    } else {
      // Fallback: manual radial overlay animation
      const overlay = document.createElement('div');
      overlay.className = 'theme-transition-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 99999; pointer-events: none;
        background: ${nextTheme === 'light' ? '#f0ece4' : '#0c0c0c'};
        clip-path: circle(0px at ${x}px ${y}px);
      `;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.transition = 'clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.style.clipPath = `circle(${maxR}px at ${x}px ${y}px)`;

        overlay.addEventListener('transitionend', () => {
          document.documentElement.setAttribute('data-theme', nextTheme);
          localStorage.setItem('vk-theme', nextTheme);
          setTheme(nextTheme);
          overlay.style.transition = 'opacity 0.3s ease';
          overlay.style.opacity = '0';
          overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        }, { once: true });
      });
    }
  }, [theme]);

  return { theme, toggleTheme };
}

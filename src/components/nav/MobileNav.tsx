'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { NAV_LINKS, PERSONAL } from '@/data/portfolio';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  /* Lock body scroll when drawer open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* Nav link click → smooth scroll + close */
  const handleNav = useCallback((href: string) => {
    setOpen(false);
    // Force-collapse any expanded project cards (restores scroll lock)
    window.dispatchEvent(new CustomEvent('forceCollapseProjects'));

    // Small delay to let collapse cleanup complete
    setTimeout(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo(href, { offset: -80, duration: 1.2 });
      } else {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }, []);

  return (
    <>
      {/* ── Hamburger button ── */}
      <button
        className={`mobile-nav-hamburger${open ? ' mobile-nav-hamburger--hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* ── Overlay ── */}
      <div
        className={`mobile-nav-overlay${open ? ' mobile-nav-overlay--open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <aside
        ref={drawerRef}
        className={`mobile-nav-drawer${open ? ' mobile-nav-drawer--open' : ''}`}
        aria-hidden={!open}
      >
        {/* Close button */}
        <button
          className="mobile-nav-close"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          ✕
        </button>

        {/* Nav links */}
        <nav className="mobile-nav-links">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNav(link.href);
              }}
            >
              <span className="mobile-nav-link-label">{link.label}</span>
              <span className="mobile-nav-link-num">
                {String(i + 1).padStart(2, '0')}
              </span>
            </a>
          ))}
        </nav>

        {/* Email pinned to bottom */}
        <a
          href={`mailto:${PERSONAL.email}`}
          className="mobile-nav-email"
        >
          {PERSONAL.email}
        </a>
      </aside>
    </>
  );
}

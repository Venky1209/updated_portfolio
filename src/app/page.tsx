'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { useTheme } from '@/hooks/useTheme';
import IntroOverlay from '@/components/intro/IntroOverlay';
import LampSwitch from '@/components/lamp/LampSwitch';
import Navbar from '@/components/navbar/Navbar';
import ScrollProgressLine from '@/components/ui/ScrollProgressLine';
import ChapterNav from '@/components/nav/ChapterNav';
import CursorManager from '@/components/cursor/CursorManager';
import DiveTransition from '@/components/dive/DiveTransition';
import Hero from '@/components/hero/Hero';
import About from '@/components/about/About';
import Skills from '@/components/skills/Skills';
import ProjectsBento from '@/components/projects/ProjectsBento';
import Experience from '@/components/experience/Experience';
import Achievements from '@/components/achievements/Achievements';
import Contact from '@/components/contact/Contact';
import MobileNav from '@/components/nav/MobileNav';
import { ArcadeProvider } from '@/components/Arcade/ArcadeContext';
import ArcadeShell from '@/components/Arcade/ArcadeShell';

export default function Home() {
  useLenis();
  const { theme, toggleTheme } = useTheme();
  const [introComplete, setIntroComplete] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  // Check sessionStorage on mount for returning visitors
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('intro-seen') === 'true') {
      setSkipIntro(true);
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    sessionStorage.setItem('intro-seen', 'true');
  }, []);

  return (
    <ArcadeProvider>
      <CursorManager />
      <DiveTransition />

      {/* Intro overlay — only on first visit */}
      {!skipIntro && !introComplete && (
        <IntroOverlay onComplete={handleIntroComplete} />
      )}

      <MobileNav />
      <LampSwitch onToggle={toggleTheme} theme={theme} />
      <Navbar />
      <ScrollProgressLine />
      <ChapterNav />

      <main style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <Hero />
        <About />
        <Experience />
        <ProjectsBento />
        <Skills />
        <Achievements />
        <Contact />
      </main>

      <footer className="site-footer">
        <div className="section-container">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} Venkatkaushal A. Built with intention.
          </p>
        </div>
      </footer>

      <ArcadeShell />

      {/* Easter egg for source-inspecting recruiters */}
      <div
        dangerouslySetInnerHTML={{
          __html: `<!--
  Built with obsession, not templates.
  If you're reading this, you're the kind of person I want to work with.
  \u2192 yunoa992@gmail.com
-->`,
        }}
        style={{ display: 'none' }}
      />
    </ArcadeProvider>
  );
}

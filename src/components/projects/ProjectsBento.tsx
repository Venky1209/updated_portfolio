'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { gsap, Flip } from '@/lib/gsap';
import { ArrowUpRight, Github } from 'lucide-react';
import PrizmDemo from '@/components/projects/PrizmDemo';
import HeartwiseDemo from '@/components/projects/HeartwiseDemo';
import SectionReveal from '@/components/ui/SectionReveal';

/* ─── Project Data ─── */
const BENTO_PROJECTS = [
  {
    id: 'prizm',
    index: '01',
    title: 'PRIZM',
    subtitle: 'Audio Intelligence',
    year: '2025',
    role: 'Full-Stack Developer',
    accent: '#c8ff00',
    liveUrl: 'https://prizmweb.vercel.app',
    repoUrl: null as string | null,
    caseStudy: {
      headline: 'AUDIO INTELLIGENCE\n& MASTERING ASSISTANT',
      columns: [
        { title: 'THE PROBLEM', text: 'Mixing audio requires years of expertise and trained ears to achieve professional-grade results.' },
        { title: 'THE APPROACH', text: 'NLP + Signal Processing + LLM for intent parsing, enabling natural language EQ control.' },
        { title: 'THE RESULT', text: 'Real-time mastering in seconds — democratizing professional audio production.' },
      ],
      stack: ['Python', 'NLP', 'Signal Processing', 'AI'],
    },
  },
  {
    id: 'heartwise',
    index: '02',
    title: 'HEARTWISE',
    subtitle: 'Cardiac AI',
    year: '2024',
    role: 'ML Engineer',
    accent: '#ff3c00',
    liveUrl: null as string | null,
    repoUrl: 'https://github.com/Venky1209/Heartwise',
    caseStudy: {
      headline: 'CARDIAC HEALTH PREDICTOR\nESP32 + AD8284 → 5 ML Models → Risk Score',
      columns: [
        { title: 'HARDWARE', text: 'ESP32 + ECG sensor → live signal acquisition from AD8284 analog front-end.' },
        { title: 'PIPELINE', text: '5 ML models ensemble average — Random Forest, SVM, Neural Net, XGBoost, DenseNet-121 — 89% accuracy.' },
        { title: 'OUTPUT', text: 'Risk score + personalized diet plan generated via Gemini API integration.' },
      ],
      stack: ['TensorFlow', 'Gemini API', 'ML', 'Healthcare'],
    },
  },
];

/* ─── Component ─── */
export default function ProjectsBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const originalStyleRef = useRef<string>('');
  const scrollYRef = useRef(0);

  /* ── Expand card to full viewport ── */
  const expandCard = useCallback((projectId: string) => {
    const idx = BENTO_PROJECTS.findIndex((p) => p.id === projectId);
    const cardEl = cardsRef.current[idx];
    if (!cardEl) return;

    // Lock scroll IMMEDIATELY (position:fixed prevents iOS rubber-band)
    scrollYRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Hide navbar (mix-blend-mode:difference bleeds through)
    const navbar = document.querySelector('.navbar') as HTMLElement;
    if (navbar) navbar.style.visibility = 'hidden';

    // Capture FLIP state before changes
    flipStateRef.current = Flip.getState(cardEl);
    originalStyleRef.current = cardEl.style.cssText;

    // Fade out everything else
    const otherCards = cardsRef.current.filter((_, i) => i !== idx);
    otherCards.forEach((c) => {
      if (c) gsap.to(c, { opacity: 0, duration: 0.2 });
    });
    const header = sectionRef.current?.querySelector('.section-label');
    if (header) gsap.to(header, { opacity: 0, duration: 0.2 });

    // Make card full-screen
    cardEl.classList.add('expanded');
    cardEl.style.cssText = `
      position: fixed; inset: 0;
      z-index: 1000; width: 100vw; height: 100vh;
      min-height: -webkit-fill-available;
      border: none; border-radius: 0;
      overflow-y: auto; overscroll-behavior: contain;
      background: var(--bg);
    `;

    // FLIP animate
    Flip.from(flipStateRef.current, {
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: () => {
        // Fade in case study content
        const contents = cardEl.querySelectorAll('.case-study-content');
        gsap.to(contents, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
        });
      },
    });

    setExpandedId(projectId);
  }, []);

  /* ── Collapse card back ── */
  const collapseCard = useCallback(() => {
    if (!expandedId) return;
    const idx = BENTO_PROJECTS.findIndex((p) => p.id === expandedId);
    const cardEl = cardsRef.current[idx];
    if (!cardEl) return;

    // Capture current state
    const state = Flip.getState(cardEl);

    // Hide case study content instantly
    const contents = cardEl.querySelectorAll('.case-study-content');
    gsap.set(contents, { opacity: 0, y: 30 });

    // Restore original styles
    cardEl.classList.remove('expanded');
    cardEl.style.cssText = originalStyleRef.current;

    // FLIP back
    Flip.from(state, {
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: () => {
        // Restore other elements
        cardsRef.current.forEach((c) => {
          if (c) gsap.to(c, { opacity: 1, duration: 0.3 });
        });
        const header = sectionRef.current?.querySelector('.section-label');
        if (header) gsap.to(header, { opacity: 1, duration: 0.3 });

        // Unlock scroll (restore position)
        const savedY = scrollYRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, savedY);

        // Show navbar
        const navbar = document.querySelector('.navbar') as HTMLElement;
        if (navbar) navbar.style.visibility = '';
      },
    });

    setExpandedId(null);
  }, [expandedId]);

  /* ── ESC key listener ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapseCard();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [collapseCard]);

  /* ── Force-collapse when navigating away (e.g. MobileNav) ── */
  useEffect(() => {
    const handleForceCollapse = () => {
      if (!expandedId) return;
      const idx = BENTO_PROJECTS.findIndex((p) => p.id === expandedId);
      const cardEl = cardsRef.current[idx];
      if (cardEl) {
        cardEl.classList.remove('expanded');
        cardEl.style.cssText = originalStyleRef.current;
        const contents = cardEl.querySelectorAll('.case-study-content');
        gsap.set(contents, { opacity: 0, y: 30 });
      }
      // Restore all cards + header
      cardsRef.current.forEach((c) => { if (c) gsap.set(c, { opacity: 1 }); });
      const header = sectionRef.current?.querySelector('.section-label');
      if (header) gsap.set(header, { opacity: 1 });
      // Unlock scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      // Show navbar
      const navbar = document.querySelector('.navbar') as HTMLElement;
      if (navbar) navbar.style.visibility = '';
      setExpandedId(null);
    };
    window.addEventListener('forceCollapseProjects', handleForceCollapse);
    return () => window.removeEventListener('forceCollapseProjects', handleForceCollapse);
  }, [expandedId]);

  /* ── Scroll-triggered card entrance animations ── */
  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <SectionReveal id="projects" className="projects-section">
      <section ref={sectionRef} className="bento-projects">
        <div className="section-container">
          <div className="section-label">
            <span>03 / Selected Work</span>
          </div>

          <div className="bento-grid">
            {BENTO_PROJECTS.map((project, i) => (
              <div
                key={project.id}
                ref={(el) => { cardsRef.current[i] = el; }}
                className={`project-card ${expandedId === project.id ? 'expanded' : ''}`}
                style={{ '--project-accent': project.accent } as React.CSSProperties}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => !expandedId && expandCard(project.id)}
              >
                {/* Demo area — top 60% */}
                <div className="demo-area">
                  {project.id === 'prizm' && (
                    <PrizmDemo active={hoveredId === 'prizm' || expandedId === 'prizm'} />
                  )}
                  {project.id === 'heartwise' && (
                    <HeartwiseDemo active={hoveredId === 'heartwise' || expandedId === 'heartwise'} />
                  )}
                </div>

                {/* Info area — bottom 40% */}
                <div className="card-info">
                  <div className="card-info-top">
                    <span className="card-index">{project.index}</span>
                    <span className="card-title">{project.title}</span>
                    <ArrowUpRight size={16} className="card-arrow" />
                  </div>
                  <div className="card-info-bottom">
                    <span className="card-subtitle">{project.subtitle}</span>
                    <span className="card-meta">{project.year} · {project.role}</span>
                  </div>
                </div>

                {/* Case study overlay — only renders when expanded */}
                {expandedId === project.id && (
                  <div className="case-study-overlay">
                    {/* Back button */}
                    <div className="case-study-content cs-header">
                      <button onClick={(e) => { e.stopPropagation(); collapseCard(); }} className="cs-back">
                        ← BACK
                      </button>
                      <span className="cs-title">{project.title}</span>
                      <span className="cs-year">{project.year}</span>
                    </div>

                    {/* Headline */}
                    <div className="case-study-content cs-headline">
                      {project.caseStudy.headline.split('\n').map((line, li) => (
                        <div key={li}>{line}</div>
                      ))}
                    </div>

                    {/* Full demo button */}
                    <div className="case-study-content cs-demo-link">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="cs-btn">
                          FULL DEMO <ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>

                    {/* Problem / Approach / Result columns */}
                    <div className="case-study-content cs-columns">
                      {project.caseStudy.columns.map((col, ci) => (
                        <div key={ci} className="cs-col">
                          <div className="cs-col-title">{col.title}</div>
                          <div className="cs-col-text">{col.text}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stack + Links */}
                    <div className="case-study-content cs-footer">
                      <div className="cs-stack">
                        <span className="cs-stack-label">STACK:</span>
                        {project.caseStudy.stack.map((s) => (
                          <span key={s} className="cs-stack-tag">{s}</span>
                        ))}
                      </div>
                      <div className="cs-links">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="cs-link">
                            LIVE DEMO <ArrowUpRight size={14} />
                          </a>
                        )}
                        {project.repoUrl && (
                          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="cs-link">
                            VIEW GITHUB <Github size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

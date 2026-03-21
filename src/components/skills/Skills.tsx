'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { SKILLS, SKILL_DETAILS } from '@/data/portfolio';
import SectionReveal from '@/components/ui/SectionReveal';

/* Proficiency bar component — 5 thin bars, filled up to proficiency level */
function ProficiencyBars({ level }: { level: number }) {
  return (
    <div className="skill-card-bars">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`skill-card-bar ${i < level ? 'filled' : ''}`}
        />
      ))}
    </div>
  );
}

export default function Skills() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ skill: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const rows = el.querySelectorAll('.skill-marquee-row');
      rows.forEach((row, i) => {
        const inner = row.querySelector('.skill-marquee-inner') as HTMLElement;
        if (!inner) return;

        // Duplicate content for seamless loop
        inner.innerHTML += inner.innerHTML;

        const direction = i % 2 === 0 ? -1 : 1;
        const width = inner.scrollWidth / 2;

        gsap.set(inner, { x: direction === -1 ? 0 : -width });

        gsap.to(inner, {
          x: direction === -1 ? -width : 0,
          duration: 30 + i * 5,
          ease: 'none',
          repeat: -1,
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleSkillEnter = (skill: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHovered({ skill, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const handleSkillLeave = () => {
    setHovered(null);
  };

  // Devicon CDN base URL
  const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

  // Map icon slug → full CDN path (devicon uses folder/file naming convention)
  const getIconUrl = (icon: string) => {
    // Special cases where devicon naming differs
    const iconMap: Record<string, string> = {
      amazonwebservices: `${DEVICON_BASE}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
      c: `${DEVICON_BASE}/c/c-original.svg`,
      css3: `${DEVICON_BASE}/css3/css3-original.svg`,
      html5: `${DEVICON_BASE}/html5/html5-original.svg`,
      java: `${DEVICON_BASE}/java/java-original.svg`,
      javascript: `${DEVICON_BASE}/javascript/javascript-original.svg`,
      python: `${DEVICON_BASE}/python/python-original.svg`,
      react: `${DEVICON_BASE}/react/react-original.svg`,
      nodejs: `${DEVICON_BASE}/nodejs/nodejs-original.svg`,
      flask: `${DEVICON_BASE}/flask/flask-original.svg`,
      tensorflow: `${DEVICON_BASE}/tensorflow/tensorflow-original.svg`,
      scikitlearn: `${DEVICON_BASE}/scikitlearn/scikitlearn-original.svg`,
      keras: `${DEVICON_BASE}/keras/keras-original.svg`,
      mongodb: `${DEVICON_BASE}/mongodb/mongodb-original.svg`,
      mysql: `${DEVICON_BASE}/mysql/mysql-original.svg`,
      googlecloud: `${DEVICON_BASE}/googlecloud/googlecloud-original.svg`,
      azure: `${DEVICON_BASE}/azure/azure-original.svg`,
      docker: `${DEVICON_BASE}/docker/docker-original.svg`,
      github: `${DEVICON_BASE}/github/github-original.svg`,
      jira: `${DEVICON_BASE}/jira/jira-original.svg`,
      figma: `${DEVICON_BASE}/figma/figma-original.svg`,
      vscode: `${DEVICON_BASE}/vscode/vscode-original.svg`,
    };
    return iconMap[icon] || `${DEVICON_BASE}/${icon}/${icon}-original.svg`;
  };

  // Flatten all skills into rows for marquee
  const allSkills = Object.entries(SKILLS);

  const detail = hovered ? SKILL_DETAILS[hovered.skill] : null;

  return (
    <SectionReveal id="skills" className="skills-section">
      <div className="section-container">
        <div className="section-label">
          <span>04 / Capabilities</span>
        </div>
      </div>
      <div ref={marqueeRef} className="skill-marquee-container">
        {allSkills.map(([category, skills]) => (
          <div key={category} className="skill-marquee-row">
            <div className="skill-marquee-inner">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="skill-marquee-item"
                  onMouseEnter={(e) => handleSkillEnter(skill.name, e)}
                  onMouseLeave={handleSkillLeave}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getIconUrl(skill.icon)}
                    alt=""
                    aria-hidden="true"
                    className="skill-icon"
                  />
                  {skill.name}
                </span>
              ))}
              <span className="skill-marquee-category">{category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating hover detail card */}
      {hovered && detail && (
        <div
          className="skill-hover-card"
          style={{
            left: hovered.x,
            top: hovered.y,
          }}
        >
          <div className="skill-card-name">{hovered.skill}</div>
          <div className="skill-card-divider" />
          <div className="skill-card-stat">{detail.years} years</div>
          <div className="skill-card-stat">Used in {detail.projects} proj</div>
          <ProficiencyBars level={detail.proficiency} />
        </div>
      )}
    </SectionReveal>
  );
}

'use client';

import Image from 'next/image';
import { EXPERIENCE } from '@/data/portfolio';
import SectionReveal from '@/components/ui/SectionReveal';

/* Map company names → logo files in /images/logos/ */
const COMPANY_LOGOS: Record<string, string> = {
  'Maestrominds Startup': '/images/logos/Maestrominds-logo.png',
  'Sri Sairam Techno Incubator Foundation': '/images/logos/incubator-logo.webp',
  'Zoho Corporation': '/images/logos/zoho-logo.png',
  'CloudElu Labs, MCC Innovation Center': '/images/logos/Cloudelu.png',
};

export default function Experience() {
  return (
    <SectionReveal id="experience" className="experience-section">
      <div className="section-container">
        <div className="section-label">
          <span>02 / Experience</span>
        </div>
        <div className="exp-list">
          {EXPERIENCE.map((exp, i) => (
            <div key={`${exp.company}-${exp.role}`} className="exp-entry">
              <div className="exp-header">
                <span className="exp-index">{String(i + 1).padStart(2, '0')}</span>
                <div className="exp-meta">
                  <div className="exp-company-row">
                    {COMPANY_LOGOS[exp.company] ? (
                      <Image
                        src={COMPANY_LOGOS[exp.company]}
                        alt={exp.company}
                        className="exp-logo"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="exp-monogram">{exp.company[0]}</div>
                    )}
                    <div className="exp-company">{exp.company}</div>
                  </div>
                  <div className="exp-role">{exp.role}</div>
                </div>
                <div className="exp-right">
                  <div className="exp-period">{exp.period}</div>
                  <div className="exp-location">{exp.location}</div>
                </div>
              </div>
              <p className="exp-desc">{exp.description}</p>
              <div className="exp-tags">
                {exp.tags.map((tag) => (
                  <span key={tag} className="exp-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

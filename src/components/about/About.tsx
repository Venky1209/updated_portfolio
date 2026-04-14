'use client';

import Image from 'next/image';
import { PERSONAL, EDUCATION } from '@/data/portfolio';
import SectionReveal from '@/components/ui/SectionReveal';

export default function About() {
  return (
    <SectionReveal id="about" className="about-section">
      <div className="section-container">
        <div className="section-label">
          <span>01 / About</span>
        </div>
        <div className="about-content">
          {/* Left column — Profile photo */}
          <div className="about-photo-col">
            <div className="about-photo-container">
              <Image
                src="/images/profile.jpg"
                alt="Venkatkaushal A."
                className="about-photo"
                width={960}
                height={1280}
              />
              {/* Accent offset border */}
              <div className="about-photo-border" />
              {/* Gradient overlay with name */}
              <div className="about-photo-overlay">
                VENKATKAUSHAL A. — CS ENGINEER
              </div>
            </div>
          </div>

          {/* Right column — Bio + stats */}
          <div className="about-bio-col">
            <p className="about-text">{PERSONAL.bio}</p>
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-value">5+</span>
                <span className="about-stat-label">Projects Shipped</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-value">4</span>
                <span className="about-stat-label">Internships</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-value">5</span>
                <span className="about-stat-label">Awards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Education below */}
        <div className="about-education-row">
          <div className="about-label">Education</div>
          <div className="education-list">
            {EDUCATION.map((edu) => (
              <div key={edu.school} className="education-item">
                <div className="education-school">{edu.school}</div>
                <div className="education-degree">{edu.degree}</div>
                <div className="education-detail">{edu.detail}</div>
                <div className="education-period">{edu.period}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

'use client';

import { ACHIEVEMENTS } from '@/data/portfolio';
import SectionReveal from '@/components/ui/SectionReveal';

export default function Achievements() {
  return (
    <SectionReveal id="achievements" className="achievements-section">
      <div className="section-container">
        <div className="section-label">
          <span>05 / Recognition</span>
        </div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((item, i) => (
            <div key={item.title} className="achievement-card">
              <div className="achievement-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="achievement-title">{item.title}</div>
              <p className="achievement-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

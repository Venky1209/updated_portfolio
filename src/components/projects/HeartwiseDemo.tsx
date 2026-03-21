'use client';

import { useRef, useEffect, useState } from 'react';

/* ─── ML Models & Constants ─── */
const MODELS = [
  { name: 'RANDOM FOREST', score: 82, delay: 0.0 },
  { name: 'SVM CLASSIFIER', score: 78, delay: 0.15 },
  { name: 'NEURAL NET', score: 85, delay: 0.30 },
  { name: 'XGBOOST', score: 79, delay: 0.45 },
  { name: 'DENSENET-121', score: 89, delay: 0.60 },
];
const AVG = Math.round(MODELS.reduce((a, b) => a + b.score, 0) / MODELS.length);

const DIET = [
  'Reduce sodium < 1500mg/day',
  'Increase omega-3 intake',
  'Moderate cardio 3×/week',
  'Limit saturated fats',
];

/* ─── Component ─── */
export function HeartwiseDemo({ active }: { active: boolean }) {
  const ecgRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [visibleModels, setVisibleModels] = useState<number[]>([]);
  const [displayScore, setDisplayScore] = useState(0);
  const [showDiet, setShowDiet] = useState(false);

  // ECG animation
  useEffect(() => {
    if (!active) return;
    let t = 0;
    const draw = () => {
      const canvas = ecgRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // Dark grid
      ctx.strokeStyle = 'rgba(255,60,0,0.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo((w / 4) * i, 0); ctx.lineTo((w / 4) * i, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, (h / 3) * i); ctx.lineTo(w, (h / 3) * i); ctx.stroke();
      }

      // ECG trace
      ctx.beginPath();
      ctx.strokeStyle = phase === 'scanning' ? '#ffeb3b' : '#ff3c00';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = phase === 'scanning' ? 16 : 6;

      for (let x = 0; x < w; x++) {
        const prog = ((x / w) + t * 0.25) % 1;
        let y = h / 2;
        if (prog > 0.10 && prog < 0.13) y = h / 2 - 8 * Math.sin((prog - 0.10) / 0.03 * Math.PI);
        else if (prog > 0.20 && prog < 0.23) y = h / 2 - 60 * Math.sin((prog - 0.20) / 0.03 * Math.PI);
        else if (prog > 0.23 && prog < 0.27) y = h / 2 + 22 * Math.sin((prog - 0.23) / 0.04 * Math.PI);
        else if (prog > 0.32 && prog < 0.38) y = h / 2 - 12 * Math.sin((prog - 0.32) / 0.06 * Math.PI);
        else if (prog > 0.55 && prog < 0.58) y = h / 2 - 6 * Math.sin((prog - 0.55) / 0.03 * Math.PI);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // BPM indicator
      ctx.fillStyle = 'rgba(255,60,0,0.6)';
      ctx.font = '9px monospace';
      ctx.fillText(`♥ ${72 + Math.floor(Math.sin(t * 2) * 3)} BPM`, 8, 14);

      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, phase]);

  const analyse = () => {
    if (phase !== 'idle') return;
    setPhase('scanning');
    setVisibleModels([]);
    setDisplayScore(0);
    setShowDiet(false);

    // Reveal models one by one (180ms stagger)
    MODELS.forEach((_, i) => {
      setTimeout(() => {
        setVisibleModels((prev) => [...prev, i]);
      }, 800 + i * 180);
    });

    // Count up score
    setTimeout(() => {
      setPhase('results');
      let s = 0;
      const interval = setInterval(() => {
        s += 2;
        setDisplayScore(Math.min(s, AVG));
        if (s >= AVG) clearInterval(interval);
      }, 30);
    }, 800 + MODELS.length * 180 + 200);

    // Diet slide in
    setTimeout(() => setShowDiet(true), 800 + MODELS.length * 180 + 800);
  };

  const reset = () => {
    setPhase('idle');
    setVisibleModels([]);
    setDisplayScore(0);
    setShowDiet(false);
  };

  return (
    <div className="heartwise-demo">
      {/* ECG Canvas */}
      <canvas
        ref={ecgRef}
        width={300}
        height={60}
        style={{ width: '100%', height: '60px', display: 'block' }}
      />

      {phase === 'idle' && (
        <button onClick={analyse} className="hw-run-btn">
          RUN ANALYSIS
        </button>
      )}

      {(phase === 'scanning' || phase === 'results') && (
        <div className="hw-results">
          {/* Model score bars */}
          {MODELS.map((m, i) =>
            visibleModels.includes(i) ? (
              <div key={i} className="hw-model-row" style={{ animation: 'slideIn 0.3s ease forwards' }}>
                <span className="hw-model-name">{m.name}</span>
                <div className="hw-bar-track">
                  <div
                    className="hw-bar-fill"
                    style={{ width: `${m.score}%` }}
                  />
                </div>
                <span className="hw-model-score">{m.score}%</span>
              </div>
            ) : null
          )}

          {/* Average risk score */}
          {displayScore > 0 && (
            <div className="hw-avg">
              <span className="hw-avg-number">{displayScore}%</span>
              <span className="hw-avg-label">AVG RISK CONFIDENCE</span>
            </div>
          )}

          {/* Diet recommendation */}
          {showDiet && (
            <div className="hw-diet" style={{ animation: 'slideIn 0.4s ease forwards' }}>
              <div className="hw-diet-title">RECOMMENDATIONS</div>
              {DIET.map((d, i) => (
                <div key={i} className="hw-diet-item">— {d}</div>
              ))}
            </div>
          )}

          <button onClick={reset} className="hw-reset-btn">
            ↺ RESET
          </button>
        </div>
      )}
    </div>
  );
}

export default HeartwiseDemo;

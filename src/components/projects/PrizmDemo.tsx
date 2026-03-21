'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/* ─── Presets & Fuzzy Match ─── */
const PRESETS: Record<string, {
  filters: { type: string; f: number; g: number }[];
  color: string;
  label: string;
}> = {
  warm: { filters: [{ type: 'lowshelf', f: 200, g: 4 }, { type: 'highshelf', f: 8000, g: -3 }, { type: 'peaking', f: 400, g: 2 }], color: '#ff8c42', label: 'WARM' },
  bright: { filters: [{ type: 'highshelf', f: 8000, g: 5 }, { type: 'lowshelf', f: 200, g: -2 }, { type: 'peaking', f: 3000, g: 3 }], color: '#c8ff00', label: 'BRIGHT' },
  punchy: { filters: [{ type: 'peaking', f: 80, g: 5 }, { type: 'peaking', f: 200, g: -3 }, { type: 'peaking', f: 3000, g: 4 }], color: '#ff3c00', label: 'PUNCHY' },
  clean: { filters: [{ type: 'peaking', f: 300, g: -2 }, { type: 'highshelf', f: 10000, g: 2 }], color: '#64b5f6', label: 'CLEAN' },
  dark: { filters: [{ type: 'highshelf', f: 5000, g: -5 }, { type: 'lowshelf', f: 300, g: 3 }], color: '#9c27b0', label: 'DARK' },
};

const KEYWORD_MAP: Record<string, string> = {
  warm: 'warm', warmth: 'warm', cozy: 'warm', mellow: 'warm', vintage: 'warm',
  bright: 'bright', crisp: 'bright', airy: 'bright', shiny: 'bright', clear: 'bright',
  punchy: 'punchy', punch: 'punchy', heavy: 'punchy', aggressive: 'punchy', hard: 'punchy',
  clean: 'clean', neutral: 'clean', transparent: 'clean', flat: 'clean',
  dark: 'dark', deep: 'dark', moody: 'dark', muddy: 'warm',
};

function match(input: string): string {
  return KEYWORD_MAP[input.toLowerCase().trim()] || 'warm';
}

/* ─── EQ Curve Drawing ─── */
function drawEQ(canvas: HTMLCanvasElement, preset: typeof PRESETS[string]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(0, (h / 4) * i); ctx.lineTo(w, (h / 4) * i); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((w / 4) * i, 0); ctx.lineTo((w / 4) * i, h); ctx.stroke();
  }

  // EQ curve
  ctx.beginPath();
  ctx.strokeStyle = preset.color;
  ctx.lineWidth = 2;
  ctx.shadowColor = preset.color;
  ctx.shadowBlur = 10;
  for (let x = 0; x < w; x++) {
    const freq = 20 * Math.pow(1000, x / w);
    let gain = 0;
    preset.filters.forEach((f) => {
      const dist = Math.abs(Math.log(freq) - Math.log(f.f));
      gain += f.g * Math.exp(-dist * 2);
    });
    const y = h / 2 - (gain / 12) * (h / 2) * 0.8;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Freq labels
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '8px monospace';
  const labels = ['20Hz', '200Hz', '2kHz', '20kHz'];
  const positions = [0, 0.25, 0.5, 0.75];
  labels.forEach((l, i) => ctx.fillText(l, w * positions[i] + 4, h - 4));
}

/* ─── Component ─── */
export function PrizmDemo({ active }: { active: boolean }) {
  const eqRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState('');
  const [preset, setPreset] = useState('warm');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('READY');
  const animRef = useRef<number>(0);

  // Animated waveform
  useEffect(() => {
    if (!active) return;
    let t = 0;
    const draw = () => {
      const canvas = waveRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const p = PRESETS[preset];
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.85;
      for (let x = 0; x < w; x++) {
        const y =
          h / 2 +
          Math.sin(x * 0.05 + t * 2.0) * h * 0.22 +
          Math.sin(x * 0.11 + t * 3.2) * h * 0.10 +
          Math.sin(x * 0.03 + t * 1.1) * h * 0.14;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, preset]);

  // Redraw EQ when preset changes
  useEffect(() => {
    if (eqRef.current) drawEQ(eqRef.current, PRESETS[preset]);
  }, [preset]);

  const apply = useCallback(() => {
    const p = match(input);
    setProcessing(true);
    setStatus('ANALYZING...');
    setTimeout(() => setStatus('APPLYING FILTERS...'), 300);
    setTimeout(() => {
      setPreset(p);
      setProcessing(false);
      setStatus(`APPLIED: ${PRESETS[p].label}`);
    }, 700);
  }, [input]);

  return (
    <div className="prizm-demo">
      {/* EQ Curve Canvas */}
      <canvas
        ref={eqRef}
        width={300}
        height={72}
        style={{ width: '100%', height: '72px', display: 'block' }}
      />

      {/* Status indicator */}
      <div
        className="prizm-status"
        style={{ color: PRESETS[preset].color }}
      >
        {status}
      </div>

      {/* Waveform Canvas */}
      <canvas
        ref={waveRef}
        width={300}
        height={44}
        style={{ width: '100%', height: '44px', display: 'block' }}
      />

      {/* Preset pills */}
      <div className="prizm-pills">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => { setPreset(key); setStatus(`APPLIED: ${p.label}`); }}
            className="prizm-pill"
            style={{
              borderColor: preset === key ? p.color : 'var(--border)',
              color: preset === key ? p.color : 'var(--text-muted)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Text input + apply */}
      <div className="prizm-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="describe a sound..."
          className="prizm-input"
        />
        <button
          onClick={apply}
          disabled={processing}
          className="prizm-apply"
          style={{
            background: processing ? 'transparent' : '#c8ff00',
            color: processing ? '#c8ff00' : '#000',
            border: processing ? '1px solid #c8ff00' : 'none',
          }}
        >
          {processing ? '...' : 'APPLY'}
        </button>
      </div>
    </div>
  );
}

export default PrizmDemo;

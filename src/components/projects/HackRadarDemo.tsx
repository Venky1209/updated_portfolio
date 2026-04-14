'use client';

import { useRef, useEffect } from 'react';

const HACKATHON_LABELS = ["HackMIT", "ETHGlobal", "MLH Prime", "Devfolio Open", "SIH 2025"];

interface Dot {
  x: number;
  y: number;
  angle: number;
  distance: number;
  discoveredAt: number;
  label?: {
    text: string;
    createdAt: number;
  };
}

export function HackRadarDemo({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dotsRef = useRef<Dot[]>([]);
  const lastLabelTimeRef = useRef<number>(0);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let maxRadius = 0;

    const configureCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      cx = W / 2;
      cy = H / 2;
      maxRadius = Math.min(W, H) / 2 - 10;
    };

    configureCanvas();

    const onResize = () => {
      configureCanvas();
      dotsRef.current = [];
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', onResize);

    let lastTime = performance.now();

    const draw = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Clear with slight trailing effect for the radar sweep
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, W, H);

      // Draw concentric rings
      ctx.strokeStyle = `rgba(0, 212, 255, 0.15)`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxRadius / 3) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.stroke();

      // Update and draw sweeping line
      angleRef.current = (angleRef.current + dt * 0.002) % (Math.PI * 2);

      // Radar beam gradient
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, angleRef.current, angleRef.current + 0.3);
      ctx.closePath();
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sweeping leading line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angleRef.current) * maxRadius, cy + Math.sin(angleRef.current) * maxRadius);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Generate random dots near the sweep angle
      if (Math.random() > 0.95) {
        const dotAngle = (angleRef.current + 0.05) % (Math.PI * 2);
        const distance = Math.random() * maxRadius;
        
        let labelData;
        if (time - lastLabelTimeRef.current > 1500 && Math.random() > 0.5) {
          labelData = {
            text: HACKATHON_LABELS[Math.floor(Math.random() * HACKATHON_LABELS.length)],
            createdAt: time,
          };
          lastLabelTimeRef.current = time;
        }

        dotsRef.current.push({
          x: cx + Math.cos(dotAngle) * distance,
          y: cy + Math.sin(dotAngle) * distance,
          angle: dotAngle,
          distance,
          discoveredAt: time,
          label: labelData,
        });
      }

      // Draw dots
      dotsRef.current = dotsRef.current.filter(dot => {
        const age = time - dot.discoveredAt;
        if (age > 3000) return false; // dot fades after 3s

        const opacity = Math.max(0, 1 - age / 3000);
        
        // Blink effect
        const isActive = Math.floor(age / 150) % 2 === 0;

        if (isActive) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.fill();
        }

        // Draw label
        if (dot.label) {
          const labelAge = time - dot.label.createdAt;
          if (labelAge < 800) {
            const labelOpacity = Math.max(0, 1 - labelAge / 800);
            ctx.fillStyle = `rgba(0, 212, 255, ${labelOpacity})`;
            ctx.font = '10px monospace';
            ctx.fillText(dot.label.text, dot.x + 8, dot.y - 4);
          }
        }

        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  return (
    <div className="hackradar-demo">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

export default HackRadarDemo;

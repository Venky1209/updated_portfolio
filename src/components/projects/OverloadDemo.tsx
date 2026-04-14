'use client';

import { useRef, useEffect, useState } from 'react';

const ACCENT_COLOR = '#ff6b00';
const BG_COLOR = 'rgba(10, 10, 10, 1)';
const GRID_COLOR = 'rgba(255, 107, 0, 0.15)';

interface Point {
  x: number;
  y: number;
}

interface Incident extends Point {
  id: number;
  pulseOffset: number;
}

interface Unit extends Point {
  id: number;
  targetId: number | null;
  path: Point[];
  state: 'moving' | 'handling' | 'idle';
  stateTime: number;
}

export function OverloadDemo({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dataRef = useRef<{
    incidents: Incident[];
    units: Unit[];
    lastHudUpdate: number;
  }>({
    incidents: [],
    units: [],
    lastHudUpdate: 0,
  });

  const [hud, setHud] = useState({ active: 2, queue: 3 });

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const gridSize = 40;

    const configureCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    configureCanvas();

    // Helper: get valid grid coordinates
    const getGridPos = (gx: number, gy: number) => ({
      x: gx * gridSize + gridSize / 2,
      y: gy * gridSize + gridSize / 2,
    });

    const initData = () => {
      if (W === 0 || H === 0) return;

      const cols = Math.max(1, Math.floor(W / gridSize));
      const rows = Math.max(1, Math.floor(H / gridSize));

      // Create 4 random incidents
      const incidents: Incident[] = [];
      for (let i = 0; i < 4; i++) {
        const gx = Math.floor(Math.random() * cols);
        const gy = Math.floor(Math.random() * rows);
        incidents.push({
          id: i,
          ...getGridPos(gx, gy),
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }

      // Create 2 units
      const units: Unit[] = [];
      for (let i = 0; i < 2; i++) {
        const gx = Math.floor(Math.random() * cols);
        const gy = Math.floor(Math.random() * rows);
        units.push({
          id: i,
          ...getGridPos(gx, gy),
          targetId: null,
          path: [],
          state: 'idle',
          stateTime: 0,
        });
      }

      dataRef.current.incidents = incidents;
      dataRef.current.units = units;
      dataRef.current.lastHudUpdate = performance.now();
    };

    const onResize = () => {
      configureCanvas();
      initData();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', onResize);

    if (dataRef.current.incidents.length === 0) {
      initData();
    }

    let lastTime = performance.now();

    const draw = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const data = dataRef.current;

      // HUD update every 2s
      if (time - data.lastHudUpdate > 2000) {
        setHud({
          active: Math.max(1, Math.floor(Math.random() * 5) + 1),
          queue: Math.floor(Math.random() * 6),
        });
        data.lastHudUpdate = time;
      }

      // Clear
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, W, H);

      // Draw Grid
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, H);
      }
      for (let y = 0; y <= H; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(W, y);
      }
      ctx.stroke();

      // Draw and update Incidents
      data.incidents.forEach(inc => {
        const pulse = (Math.sin(time * 0.005 + inc.pulseOffset) + 1) / 2; // 0 to 1
        
        ctx.beginPath();
        ctx.arc(inc.x, inc.y, 4 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 0, ${0.2 + pulse * 0.5})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(inc.x, inc.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fill();
      });

      // Update and draw Units
      data.units.forEach(unit => {
        if (unit.state === 'idle') {
          // Find nearest incident not currently targeted
          let nearestDist = Infinity;
          let nearestInc: Incident | null = null;

          for (const inc of data.incidents) {
            const isTargeted = data.units.some(u => u.targetId === inc.id);
            if (!isTargeted) {
              const dist = Math.abs(unit.x - inc.x) + Math.abs(unit.y - inc.y); // Manhattan distance
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestInc = inc;
              }
            }
          }

          // Fallback if all targeted, just pick closest
          if (!nearestInc && data.incidents.length > 0) {
            for (const inc of data.incidents) {
              const dist = Math.abs(unit.x - inc.x) + Math.abs(unit.y - inc.y);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestInc = inc;
              }
            }
          }

          if (nearestInc) {
            unit.targetId = nearestInc.id;
            unit.state = 'moving';
            
            // Build simple Manhattan path
            unit.path = [
              { x: unit.x, y: nearestInc.y },
              { x: nearestInc.x, y: nearestInc.y }
            ];
          }
        } else if (unit.state === 'moving' && unit.path.length > 0) {
          const target = unit.path[0];
          const speed = dt * 0.1;
          
          const dx = target.x - unit.x;
          const dy = target.y - unit.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < speed) {
            unit.x = target.x;
            unit.y = target.y;
            unit.path.shift();
            
            if (unit.path.length === 0) {
              unit.state = 'handling';
              unit.stateTime = time;
            }
          } else {
            unit.x += (dx / dist) * speed;
            unit.y += (dy / dist) * speed;
          }
        } else if (unit.state === 'handling') {
          if (time - unit.stateTime > 500) {
            // Relocate incident
            const incIndex = data.incidents.findIndex(i => i.id === unit.targetId);
            if (incIndex >= 0) {
              const cols = Math.max(1, Math.floor(W / gridSize));
              const rows = Math.max(1, Math.floor(H / gridSize));
               data.incidents[incIndex] = {
                 ...data.incidents[incIndex],
                 ...getGridPos(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows))
               };
            }

            unit.state = 'idle';
            unit.targetId = null;
          }
        }

        // Draw Unit
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = BG_COLOR;
        ctx.stroke();
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
    <div className="overload-demo">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* HUD overlay */}
      <div className="overload-hud">
        <span>ACTIVE: {hud.active}</span>
        <span>QUEUE: {hud.queue}</span>
      </div>
    </div>
  );
}

export default OverloadDemo;

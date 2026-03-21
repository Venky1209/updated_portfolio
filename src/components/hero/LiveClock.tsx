'use client';

import { useEffect, useState } from 'react';

/*
  LiveClock — Ticking IST clock displayed in the hero.
  Shows: Chennai, India · IST · HH:MM:SS
  Updates every second. Signals presence + liveness.
*/

export default function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing on server — avoids hydration mismatch
  if (time === null) return null;

  return (
    <div className="hero-clock-line">
      <span className="hero-clock-location">Chennai, India</span>
      <span className="hero-clock-sep">&middot;</span>
      <span className="hero-clock-tz">IST</span>
      <span className="hero-clock-sep">&middot;</span>
      <span className="hero-clock-time">{time}</span>
    </div>
  );
}

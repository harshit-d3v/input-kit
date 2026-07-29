/**
 * React demo for @input-kit/confetti
 * Demonstrates all options and preset effects.
 */

import React, { useState, useRef } from 'react';
import { confetti, fireConfetti, celebrate } from '../src/index';

const btn: React.CSSProperties = {
  padding: '10px 22px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
};

export function ConfettiDemo() {
  const [particleCount, setParticleCount] = useState(100);
  const [angle, setAngle] = useState(90);
  const [spread, setSpread] = useState(360);
  const [gravity, setGravity] = useState(0.5);
  const [drift, setDrift] = useState(0);
  const [ticks, setTicks] = useState(200);
  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  // ── Section 1: Presets ───────────────────────────────────────────────────
  const handleBasic = () => confetti();

  const handleCelebrate = () => celebrate();

  const handleFireworks = () => {
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleRainbow = () => {
    confetti({
      particleCount: 200,
      spread: 180,
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    });
  };

  const handleSnow = () => {
    confetti({
      particleCount: 300,
      angle: 270,
      spread: 60,
      origin: { x: 0.5, y: 0 },
      colors: ['#ffffff', '#cce8ff', '#d9f5ff'],
      gravity: 0.2,
      drift: 0.3,
      ticks: 400,
    });
  };

  const handleCannon = () => {
    confetti({
      particleCount: 80,
      angle: 45,
      spread: 30,
      origin: { x: 0, y: 1 },
      gravity: 0.8,
    });
  };

  // ── Section 2: Cancellable long animation ────────────────────────────────
  const handleStartLong = () => {
    cancelRef.current?.();
    cancelRef.current = confetti({ particleCount: 500, ticks: 600 });
  };

  const handleCancel = () => {
    cancelRef.current?.();
    cancelRef.current = undefined;
  };

  // ── Section 3: Custom ────────────────────────────────────────────────────
  const handleCustom = () => {
    confetti({
      particleCount,
      angle,
      spread,
      gravity,
      drift,
      ticks,
      origin: { x: originX, y: originY },
    });
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', maxWidth: 800 }}>
      <h2 style={{ marginTop: 0 }}>@input-kit/confetti</h2>

      {/* Presets */}
      <section style={{ marginBottom: 32 }}>
        <h3>Presets</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ ...btn, background: '#667eea' }} onClick={handleBasic}>
            Basic
          </button>
          <button style={{ ...btn, background: '#f093fb' }} onClick={handleCelebrate}>
            Celebrate
          </button>
          <button style={{ ...btn, background: '#fa709a' }} onClick={handleFireworks}>
            Fireworks (3s)
          </button>
          <button
            style={{
              ...btn,
              background: 'linear-gradient(to right,#ff0000,#ff7f00,#ffff00,#00cf00,#0000ff)',
            }}
            onClick={handleRainbow}
          >
            Rainbow
          </button>
          <button style={{ ...btn, background: '#74b9ff' }} onClick={handleSnow}>
            Snow
          </button>
          <button style={{ ...btn, background: '#e17055' }} onClick={handleCannon}>
            Cannon (bottom-left)
          </button>
        </div>
      </section>

      {/* Cancellable */}
      <section style={{ marginBottom: 32 }}>
        <h3>Cancellable animation</h3>
        <p style={{ fontSize: 13, color: '#555', marginTop: 0 }}>
          <code>confetti()</code> returns a cancel function. Click Stop to cancel mid-flight.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ ...btn, background: '#00b894' }} onClick={handleStartLong}>
            Start (long)
          </button>
          <button style={{ ...btn, background: '#d63031' }} onClick={handleCancel}>
            Stop
          </button>
        </div>
      </section>

      {/* Custom options */}
      <section>
        <h3>Custom options</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 20,
          }}
        >
          {[
            { label: `Particle count: ${particleCount}`, min: 10, max: 500, step: 1, value: particleCount, set: setParticleCount },
            { label: `Angle: ${angle}°`, min: 0, max: 360, step: 5, value: angle, set: setAngle },
            { label: `Spread: ${spread}°`, min: 0, max: 360, step: 5, value: spread, set: setSpread },
            { label: `Gravity: ${gravity.toFixed(1)}`, min: 0, max: 2, step: 0.1, value: gravity, set: setGravity },
            { label: `Drift: ${drift.toFixed(1)}`, min: -1, max: 1, step: 0.1, value: drift, set: setDrift },
            { label: `Ticks: ${ticks}`, min: 50, max: 600, step: 10, value: ticks, set: setTicks },
            { label: `Origin X: ${originX.toFixed(2)}`, min: 0, max: 1, step: 0.05, value: originX, set: setOriginX },
            { label: `Origin Y: ${originY.toFixed(2)}`, min: 0, max: 1, step: 0.05, value: originY, set: setOriginY },
          ].map(({ label, min, max, step, value, set }) => (
            <div key={label}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>{label}</label>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => set(Number(e.target.value) as never)}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
        <button style={{ ...btn, background: '#6c5ce7' }} onClick={handleCustom}>
          Fire Custom Confetti
        </button>
      </section>

      {/* Reference */}
      <section style={{ marginTop: 32, padding: 16, background: '#f8f9fa', borderRadius: 8, fontSize: 13 }}>
        <h4 style={{ marginTop: 0 }}>Option reference</h4>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: '1.8' }}>
          <li><strong>angle</strong>: 0 = right, 90 = up, 180 = left, 270 = down</li>
          <li><strong>spread</strong>: cone width centered on angle. 360 = all directions</li>
          <li><strong>origin</strong>: (0,0) = top-left, (1,1) = bottom-right, (0.5,0.5) = center</li>
          <li><strong>gravity</strong>: downward acceleration per frame</li>
          <li><strong>drift</strong>: positive = right, negative = left</li>
          <li><strong>ticks</strong>: particle lifetime in frames (~60 fps)</li>
        </ul>
      </section>
    </div>
  );
}

export function DemoApp() {
  return <ConfettiDemo />;
}

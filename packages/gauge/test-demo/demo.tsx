import React, { useState } from 'react';
import { Gauge, LinearGauge, SemiGauge, useGaugeAnimation } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };
const row: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
  alignItems: 'center',
};

// ─── 1. Circular gauge, driven by a slider ────────────────────────────────────
function CircularExample() {
  const [value, setValue] = useState(72);

  return (
    <div style={section}>
      <h2>Circular gauge</h2>
      <label style={label} htmlFor="g-value">
        Value: {value}
      </label>
      <input
        id="g-value"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: '260px' }}
      />
      <div style={row}>
        <Gauge value={value} label="CPU load" />
        <SemiGauge value={value} label="Half sweep" size={200} />
      </div>
      <p style={note}>
        The needle rotates with a CSS transform and the coloured arc is revealed by{' '}
        <code>stroke-dashoffset</code>, so both genuinely animate between values.
      </p>
    </div>
  );
}

// ─── 2. Linear gauges, horizontal and vertical ────────────────────────────────
function LinearExample() {
  const [value, setValue] = useState(45);

  return (
    <div style={section}>
      <h2>Linear gauge</h2>
      <label style={label} htmlFor="l-value">
        Value: {value}
      </label>
      <input
        id="l-value"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: '260px' }}
      />
      <div style={{ ...row, marginTop: '1rem' }}>
        <LinearGauge value={value} label="Disk" width={280} />
        <LinearGauge value={value} label="Memory" vertical width={120} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <LinearGauge value={value} label="With ticks" width={280} showTicks tickCount={5} />
      </div>
    </div>
  );
}

// ─── 3. A range that is not 0–100 ─────────────────────────────────────────────
function CustomRangeExample() {
  return (
    <div style={section}>
      <h2>Custom range</h2>
      <p style={note}>Bounds need not be 0–100, and values outside them are clamped.</p>
      <div style={row}>
        <LinearGauge
          value={37.5}
          min={20}
          max={40}
          label="Temperature"
          width={260}
          valueFormatter={(v) => `${v.toFixed(1)}°C`}
        />
        <LinearGauge value={9999} min={0} max={500} label="Clamped at max" width={260} />
      </div>
    </div>
  );
}

// ─── 4. Animated value ────────────────────────────────────────────────────────
function AnimatedExample() {
  const [target, setTarget] = useState(20);
  const animated = useGaugeAnimation(target, 700);

  return (
    <div style={section}>
      <h2>useGaugeAnimation</h2>
      <p style={note}>
        Eases the displayed value towards a target. Currently {animated.toFixed(1)}.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <button
            key={v}
            onClick={() => setTarget(v)}
            style={{ padding: '4px 12px', cursor: 'pointer' }}
          >
            {v}
          </button>
        ))}
      </div>
      <Gauge value={animated} label="Animated" animated={false} />
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/gauge</h1>
      <p>Circular, semicircular and linear gauges, reported to assistive tech as meters.</p>
      <CircularExample />
      <LinearExample />
      <CustomRangeExample />
      <AnimatedExample />
    </div>
  );
}

export default Demo;

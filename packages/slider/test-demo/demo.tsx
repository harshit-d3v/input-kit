import React, { useState } from 'react';
import { RangeSlider, Slider } from '../src/index';

export function Demo() {
  const [volume, setVolume] = useState(36);
  const [priceRange, setPriceRange] = useState<[number, number]>([180, 760]);
  const [temperature, setTemperature] = useState(18);

  return (
    <div style={{ padding: '2rem', maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <h1>@input-kit/slider</h1>
      <p>Accessible single-value and range sliders with keyboard support and final-change callbacks.</p>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Single Slider</h2>
        <p style={{ marginBottom: '1.25rem', color: '#475569' }}>Volume control with marks, ticks, and formatted value text.</p>
        <Slider
          value={volume}
          onChange={setVolume}
          min={0}
          max={100}
          step={1}
          showTooltip
          showTicks
          tickCount={6}
          marks={[
            { value: 0, label: 'Mute' },
            { value: 50, label: 'Comfort' },
            { value: 100, label: 'Max' },
          ]}
          formatValue={(value) => `${value}%`}
          aria-label="Volume"
          style={{ width: '100%', paddingBottom: '2.5rem' }}
        />
        <div style={{ marginTop: '2rem', fontWeight: 600 }}>Current volume: {volume}%</div>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Range Slider</h2>
        <p style={{ marginBottom: '1.25rem', color: '#475569' }}>Price range with minimum thumb distance and keyboard-adjustable thumbs.</p>
        <RangeSlider
          value={priceRange}
          onChange={setPriceRange}
          min={0}
          max={1000}
          step={10}
          minDistance={80}
          showTooltip
          formatValue={(value) => `$${value}`}
          aria-label="Price range"
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <strong>Selected:</strong>
          <span>${priceRange[0]}</span>
          <span>to</span>
          <span>${priceRange[1]}</span>
        </div>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '1rem' }}>Vertical Slider</h2>
          <p style={{ color: '#475569' }}>Useful for media mixers, brightness, or thermostat controls.</p>
          <div style={{ marginTop: '1rem', fontWeight: 600 }}>Temperature: {temperature} C</div>
        </div>
        <Slider
          value={temperature}
          onChange={setTemperature}
          min={5}
          max={30}
          step={1}
          orientation="vertical"
          showTooltip
          formatValue={(value) => `${value} C`}
          aria-label="Temperature"
          style={{ height: 220, padding: '0 1rem' }}
        />
      </section>
    </div>
  );
}

export default Demo;

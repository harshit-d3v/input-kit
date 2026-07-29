import React, { useState } from 'react';
import {
  ColorInput,
  useColorPicker,
  useColorInput,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToOklch,
  getContrastText,
  getContrastRatio,
  isValidColor,
  parseColor,
  formatColor,
} from '../src/index';
import type { ColorFormat } from '../src/index';

const sectionStyle: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const monoStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '12px',
  background: '#f3f4f6',
  padding: '2px 6px',
  borderRadius: '4px',
};

// ─── 1. Basic ColorInput ──────────────────────────────────────────────────────
function BasicExample() {
  const [color, setColor] = useState('#6366f1');
  const parsed = parseColor(color);

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Basic ColorInput</h2>
      <label style={labelStyle}>Color</label>
      <ColorInput value={color} onChange={setColor} format="hex" />
      {parsed && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '13px', flexWrap: 'wrap' }}>
          <span style={monoStyle}>HEX {parsed.hex}</span>
          <span style={monoStyle}>RGB {parsed.rgb.r}, {parsed.rgb.g}, {parsed.rgb.b}</span>
          <span style={monoStyle}>HSL {parsed.hsl.h}° {parsed.hsl.s}% {parsed.hsl.l}%</span>
        </div>
      )}
    </div>
  );
}

// ─── 2. With Alpha Channel ────────────────────────────────────────────────────
function AlphaExample() {
  const [color, setColor] = useState('rgba(99, 102, 241, 0.7)');

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Alpha Channel</h2>
      <ColorInput value={color} onChange={setColor} format="rgb" showAlpha />
      <p style={{ marginTop: '10px', fontSize: '13px', color: '#6b7280' }}>
        Value: <span style={monoStyle}>{color}</span>
      </p>
    </div>
  );
}

// ─── 3. All formats with format switcher ─────────────────────────────────────
function FormatSwitcherExample() {
  const [format, setFormat] = useState<ColorFormat>('hex');
  const { color, setColor, hex, rgb, hsl, hsv, oklch, setFormat: setPickerFormat } = useColorPicker({
    defaultValue: '#10b981',
    format,
  });

  const handleFormatChange = (f: ColorFormat) => {
    setFormat(f);
    setPickerFormat(f);
  };

  const formats: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv', 'oklch'];

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>useColorPicker — All Formats</h2>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {formats.map((f) => (
          <button
            key={f}
            onClick={() => handleFormatChange(f)}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: `2px solid ${format === f ? '#6366f1' : '#e5e7eb'}`,
              background: format === f ? '#eef2ff' : '#f9fafb',
              cursor: 'pointer',
              fontWeight: format === f ? 700 : 400,
              fontSize: '13px',
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, background: hex, border: '1px solid #e5e7eb', flexShrink: 0 }} />
        <input
          value={formatColor(color, format)}
          onChange={(e) => setColor(e.target.value)}
          style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: 4, width: 260 }}
        />
      </div>
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '6px' }}>
        <span style={monoStyle}>HEX: {hex}</span>
        <span style={monoStyle}>RGB: {rgb.r} {rgb.g} {rgb.b}</span>
        <span style={monoStyle}>HSL: {hsl.h}° {hsl.s}% {hsl.l}%</span>
        <span style={monoStyle}>HSV: {hsv.h}° {hsv.s}% {hsv.v}%</span>
        <span style={monoStyle}>OKLCH: {oklch.l} {oklch.c} {oklch.h}°</span>
      </div>
    </div>
  );
}

// ─── 4. Custom presets ────────────────────────────────────────────────────────
function CustomPresetsExample() {
  const [color, setColor] = useState('#6366f1');

  const brandColors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Sky', value: '#0ea5e9' },
  ];

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Custom Presets</h2>
      <ColorInput value={color} onChange={setColor} presets={brandColors} />
      <p style={{ marginTop: '10px', fontSize: '13px', color: '#6b7280' }}>
        Selected: <span style={monoStyle}>{color}</span>
      </p>
    </div>
  );
}

// ─── 5. Headless useColorInput ────────────────────────────────────────────────
function HeadlessExample() {
  const {
    inputValue, hex, rgb, alpha, isValid, isOpen, presets,
    containerRef, getInputProps, getToggleProps, getPickerProps,
    getPresetProps, getAlphaSliderProps,
  } = useColorInput({
    value: '#f43f5e',
    onChange: () => {},
    showAlpha: true,
    format: 'hex',
  });

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Headless useColorInput</h2>
      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
        Full custom UI using prop-getter pattern.
      </p>
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            {...getToggleProps()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: hex,
              border: `2px solid ${isValid ? '#6366f1' : '#e5e7eb'}`,
              cursor: 'pointer',
              padding: 0,
            }}
          />
          <input
            {...getInputProps()}
            style={{
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: `1px solid ${isValid ? '#d1d5db' : '#f87171'}`,
              borderRadius: 4,
              width: 180,
            }}
          />
        </div>
        {isOpen && (
          <div
            {...getPickerProps()}
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100,
              minWidth: 200,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 12 }}>
              {presets.map((p, i) => (
                <button
                  key={p.value}
                  {...getPresetProps(p, i)}
                  style={{ width: 24, height: 24, borderRadius: 4, background: p.value, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 0 }}
                />
              ))}
            </div>
            <label style={labelStyle}>Alpha: {Math.round(alpha * 100)}%</label>
            <input {...getAlphaSliderProps()} style={{ width: '100%' }} />
          </div>
        )}
      </div>
      <div style={{ marginTop: '12px', fontSize: '13px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span style={monoStyle}>Input: {inputValue}</span>
        <span style={monoStyle}>RGB: {rgb.r} {rgb.g} {rgb.b}</span>
        <span style={monoStyle}>Alpha: {alpha.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── 6. Accessibility / Contrast utilities ────────────────────────────────────
function AccessibilityExample() {
  const [bg, setBg] = useState('#1e3a5f');
  const [fg, setFg] = useState('#ffffff');

  const ratio = getContrastRatio(bg, fg);
  const autoText = getContrastText(bg);
  const passAA = ratio >= 4.5;
  const passAAA = ratio >= 7;

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Contrast Utilities</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>Background</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: isValidColor(bg) ? bg : '#e5e7eb', border: '1px solid #e5e7eb' }} />
            <input value={bg} onChange={(e) => setBg(e.target.value)} style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: 4, width: 120 }} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Foreground</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: isValidColor(fg) ? fg : '#e5e7eb', border: '1px solid #e5e7eb' }} />
            <input value={fg} onChange={(e) => setFg(e.target.value)} style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: 4, width: 120 }} />
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          padding: '16px 20px',
          background: isValidColor(bg) ? bg : '#e5e7eb',
          color: isValidColor(fg) ? fg : '#000',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        Sample text — contrast ratio {ratio.toFixed(2)}:1
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: 13 }}>
        <span style={{ ...monoStyle, background: passAA ? '#dcfce7' : '#fee2e2', color: passAA ? '#166534' : '#991b1b' }}>
          WCAG AA {passAA ? 'pass' : 'fail'} (min 4.5)
        </span>
        <span style={{ ...monoStyle, background: passAAA ? '#dcfce7' : '#fee2e2', color: passAAA ? '#166534' : '#991b1b' }}>
          WCAG AAA {passAAA ? 'pass' : 'fail'} (min 7)
        </span>
        <span style={monoStyle}>Auto text: {autoText}</span>
      </div>
    </div>
  );
}

// ─── 7. Raw utility functions showcase ───────────────────────────────────────
function UtilitiesExample() {
  const [hex, setHex] = useState('#3b82f6');
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb) : null;
  const hsv = rgb ? rgbToHsv(rgb) : null;
  const oklch = rgb ? rgbToOklch(rgb) : null;
  const roundtrip = rgb ? rgbToHex(rgb) : null;

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Utility Functions</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: isValidColor(hex) ? hex : '#e5e7eb', border: '1px solid #e5e7eb' }} />
        <input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#3b82f6"
          style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: 4, width: 160 }}
        />
      </div>
      {rgb && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={monoStyle}>hexToRgb → r:{rgb.r} g:{rgb.g} b:{rgb.b}</span>
          <span style={monoStyle}>rgbToHex → {roundtrip}</span>
          {hsl && <span style={monoStyle}>rgbToHsl → h:{hsl.h} s:{hsl.s}% l:{hsl.l}%</span>}
          {hsv && <span style={monoStyle}>rgbToHsv → h:{hsv.h} s:{hsv.s}% v:{hsv.v}%</span>}
          {oklch && <span style={monoStyle}>rgbToOklch → l:{oklch.l} c:{oklch.c} h:{oklch.h}°</span>}
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <h1 style={{ margin: '0 0 4px' }}>@input-kit/color</h1>
      <p style={{ margin: '0 0 8px', color: '#6b7280' }}>
        Headless color picker — HEX, RGB, HSL, HSV, OKLCH, alpha, WCAG contrast
      </p>
      <BasicExample />
      <AlphaExample />
      <FormatSwitcherExample />
      <CustomPresetsExample />
      <HeadlessExample />
      <AccessibilityExample />
      <UtilitiesExample />
    </div>
  );
}

export default Demo;

import React, { useState } from 'react';
import { MaskedInput, useMask, masks } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };
const mono: React.CSSProperties = {
  fontFamily: 'monospace',
  background: '#f3f4f6',
  padding: '2px 6px',
  borderRadius: '4px',
};
const label: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

// ─── 1. The built-in masks ────────────────────────────────────────────────────
function PresetsExample() {
  const entries = Object.entries(masks) as [keyof typeof masks, string][];

  return (
    <div style={section}>
      <h2>Built-in masks</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {entries.map(([name, pattern]) => (
          <div key={name}>
            <label style={label}>
              {name} <span style={mono}>{pattern}</span>
            </label>
            <MaskedInput mask={pattern} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Mask characters, including the uppercasing one ────────────────────────
function CharactersExample() {
  return (
    <div style={section}>
      <h2>Mask characters</h2>
      <ul style={{ fontSize: '13px', lineHeight: 1.9 }}>
        <li><span style={mono}>9</span> — any digit</li>
        <li><span style={mono}>a</span> — any letter, lower-cased</li>
        <li><span style={mono}>A</span> — any letter, upper-cased</li>
        <li><span style={mono}>*</span> — alphanumeric</li>
        <li><span style={mono}>#</span> — hexadecimal</li>
        <li><span style={mono}>\</span> — escapes the next character</li>
      </ul>
      <label style={label}>
        Licence plate <span style={mono}>AAA-9999</span> — letters upper-case themselves
      </label>
      <MaskedInput mask="AAA-9999" />
      <label style={{ ...label, marginTop: '1rem' }}>
        Hex colour <span style={mono}>\#######</span>
      </label>
      <MaskedInput mask="\\#######" />
    </div>
  );
}

// ─── 3. Guide on and off ──────────────────────────────────────────────────────
function GuideExample() {
  return (
    <div style={section}>
      <h2>Guide</h2>
      <p style={note}>
        With <code>guide</code> on, unfilled positions show a placeholder character.
        With it off, the value stays exactly as long as what you have typed — and
        Backspace removes a character rather than writing an underscore over it.
      </p>
      <label style={label}>guide (default)</label>
      <MaskedInput mask={masks.phone} />
      <label style={{ ...label, marginTop: '1rem' }}>guide off</label>
      <MaskedInput mask={masks.phone} guide={false} showMaskOnFocus={false} />
    </div>
  );
}

// ─── 4. The hook, exposing both values ────────────────────────────────────────
function HookExample() {
  const [record, setRecord] = useState({ value: '', raw: '' });
  const mask = useMask({
    mask: masks.ssn,
    onChange: (value, rawValue) => setRecord({ value, raw: rawValue }),
  });

  return (
    <div style={section}>
      <h2>useMask</h2>
      <label style={label}>Social security number</label>
      <input
        ref={mask.inputRef}
        value={mask.value}
        onChange={mask.handleChange}
        onKeyDown={mask.handleKeyDown}
        onFocus={mask.handleFocus}
        onBlur={mask.handleBlur}
        style={{ fontFamily: 'monospace', padding: '8px 12px', fontSize: '16px' }}
      />
      <p style={note}>
        Masked: <span style={mono}>{record.value || '(empty)'}</span> · raw:{' '}
        <span style={mono}>{record.raw || '(empty)'}</span> · complete:{' '}
        <span style={mono}>{String(mask.isComplete)}</span>
      </p>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/mask</h1>
      <p>Pattern-masked text input, with the masked and raw values both available.</p>
      <PresetsExample />
      <CharactersExample />
      <GuideExample />
      <HookExample />
    </div>
  );
}

export default Demo;

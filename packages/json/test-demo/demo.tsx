import React, { useState } from 'react';
import { JSONViewer, formatJSON, isValidJSON } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };

const sample = {
  id: 4821,
  name: 'Ada Lovelace',
  active: true,
  score: null,
  tags: ['engineering', 'analysis'],
  address: { city: 'London', postcode: 'NW1', geo: { lat: 51.52, lng: -0.14 } },
  history: [
    { at: '2026-01-04', event: 'created' },
    { at: '2026-03-19', event: 'updated' },
  ],
};

// ─── 1. Themes and toggles ────────────────────────────────────────────────────
function ViewerExample() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [collapsed, setCollapsed] = useState(false);
  const [types, setTypes] = useState(true);
  const [sizes, setSizes] = useState(true);

  const toggle = (
    labelText: string,
    checked: boolean,
    onChange: (v: boolean) => void
  ) => (
    <label style={{ fontSize: '13px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {labelText}
    </label>
  );

  return (
    <div style={section}>
      <h2>Viewer</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {toggle('collapsed', collapsed, setCollapsed)}
        {toggle('data types', types, setTypes)}
        {toggle('sizes', sizes, setSizes)}
        <label style={{ fontSize: '13px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          theme
          <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
      </div>
      <JSONViewer
        data={sample}
        theme={theme}
        collapsed={collapsed}
        displayDataTypes={types}
        displayObjectSize={sizes}
        enableClipboard
      />
      <p style={note}>
        The expand/collapse controls are real buttons, so the tree can be walked with
        Tab and toggled with Enter or Space.
      </p>
    </div>
  );
}

// ─── 2. Awkward values ────────────────────────────────────────────────────────
function EdgeCasesExample() {
  const circular: Record<string, unknown> = { name: 'root', count: 2 };
  circular.self = circular;

  const awkward = {
    emptyObject: {},
    emptyArray: [],
    nested: [[1, 2], [3, 4]],
    date: new Date('2026-07-31T12:00:00Z'),
    regex: /^ab+c$/i,
    set: new Set([1, 2, 3]),
    map: new Map([['k', 'v']]),
    undefinedValue: undefined,
    longString: 'x'.repeat(120),
  };

  return (
    <div style={section}>
      <h2>Awkward values</h2>
      <p style={note}>
        Dates, regexes, Maps and Sets render as themselves rather than as empty
        objects, and a self-referencing object is marked rather than recursed into.
      </p>
      <JSONViewer data={awkward} collapseStringsAfterLength={40} />
      <h3 style={{ fontSize: '14px', marginTop: '1.5rem' }}>Circular reference</h3>
      <JSONViewer data={circular} />
    </div>
  );
}

// ─── 3. Validation helpers ────────────────────────────────────────────────────
function HelpersExample() {
  const [text, setText] = useState('{ "a": 1 }');
  const valid = isValidJSON(text);

  return (
    <div style={section}>
      <h2>Helpers</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px', padding: '8px' }}
      />
      <p style={note}>
        <code>isValidJSON</code>: {valid ? 'valid' : 'invalid'}
      </p>
      {valid && (
        <>
          <p style={note}>
            <code>formatJSON</code> output:
          </p>
          <pre style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
            {formatJSON(JSON.parse(text))}
          </pre>
        </>
      )}
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/json</h1>
      <p>Collapsible JSON tree viewer with light and dark themes.</p>
      <ViewerExample />
      <EdgeCasesExample />
      <HelpersExample />
    </div>
  );
}

export default Demo;

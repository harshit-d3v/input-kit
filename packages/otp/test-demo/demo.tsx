import React, { useState } from 'react';
import { OtpInput, OtpInputUnderline, OtpInputCircle, useOtpInput } from '../src/index';

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

// ─── 1. Uncontrolled, reporting completion ────────────────────────────────────
function BasicExample() {
  const [completed, setCompleted] = useState<string | null>(null);
  const [current, setCurrent] = useState('');

  return (
    <div style={section}>
      <h2>Basic</h2>
      <OtpInput length={6} onChange={setCurrent} onComplete={setCompleted} />
      <p style={note}>
        Value: <span style={mono}>{current || '(empty)'}</span>
      </p>
      <p style={note}>
        {completed
          ? `onComplete fired once with "${completed}"`
          : 'onComplete fires exactly once, when the last digit lands.'}
      </p>
    </div>
  );
}

// ─── 2. Controlled ────────────────────────────────────────────────────────────
function ControlledExample() {
  const [value, setValue] = useState('12');

  return (
    <div style={section}>
      <h2>Controlled</h2>
      <OtpInput length={6} value={value} onChange={setValue} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
        <button onClick={() => setValue('123456')} style={{ cursor: 'pointer' }}>Fill</button>
        <button onClick={() => setValue('')} style={{ cursor: 'pointer' }}>Clear</button>
        <button onClick={() => setValue('12-34')} style={{ cursor: 'pointer' }}>
          Set &quot;12-34&quot;
        </button>
      </div>
      <p style={note}>
        The last button feeds in a separator. Characters that fail the type pattern are
        dropped rather than looping the sync effect.
      </p>
    </div>
  );
}

// ─── 3. Types and styling variants ────────────────────────────────────────────
function VariantsExample() {
  return (
    <div style={section}>
      <h2>Variants</h2>
      <p style={note}>Alphanumeric, four cells, upper-cased as you type:</p>
      <OtpInput length={4} type="alphanumeric" />
      <p style={{ ...note, marginTop: '1.5rem' }}>Underline:</p>
      <OtpInputUnderline length={4} />
      <p style={{ ...note, marginTop: '1.5rem' }}>Circle, masked:</p>
      <OtpInputCircle length={4} masked />
      <p style={{ ...note, marginTop: '1.5rem' }}>With a separator after the third cell:</p>
      <OtpInput length={6} separator="—" separatorAfter={[2]} />
    </div>
  );
}

// ─── 4. The hook directly ─────────────────────────────────────────────────────
function HookExample() {
  const otp = useOtpInput({ length: 4, type: 'numeric' });

  return (
    <div style={section}>
      <h2>useOtpInput</h2>
      <p style={note}>
        Cells: <span style={mono}>[{otp.value.map((c) => c || '_').join(', ')}]</span>
      </p>
      <p style={note}>
        Complete: <span style={mono}>{String(otp.isComplete)}</span>
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => otp.setValue('9999')} style={{ cursor: 'pointer' }}>Set 9999</button>
        <button onClick={otp.clear} style={{ cursor: 'pointer' }}>Clear</button>
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/otp</h1>
      <p>
        One-time-code input. Arrow keys, Home/End, Backspace across cells, and paste of a
        whole code all work.
      </p>
      <BasicExample />
      <ControlledExample />
      <VariantsExample />
      <HookExample />
    </div>
  );
}

export default Demo;

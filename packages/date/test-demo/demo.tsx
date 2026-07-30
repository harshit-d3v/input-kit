import React, { useState } from 'react';
import { Calendar, DatePicker, formatDate, parseDate, addDays } from '../src/index';

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

// ─── 1. Calendar with keyboard navigation ─────────────────────────────────────
function CalendarExample() {
  const [value, setValue] = useState<Date>(new Date());

  return (
    <div style={section}>
      <h2>Calendar</h2>
      <p style={note}>
        Tab once to reach the grid, then use the arrow keys — Left/Right by a day,
        Up/Down by a week, Home/End to the ends of the week, PageUp/PageDown by a
        month (hold Shift for a year). Only one day is ever a tab stop.
      </p>
      <Calendar value={value} onChange={setValue} />
      <p style={note}>
        Selected: <span style={mono}>{formatDate(value, 'MMMM DD, YYYY')}</span>
      </p>
    </div>
  );
}

// ─── 2. Bounded range ─────────────────────────────────────────────────────────
function BoundedExample() {
  const today = new Date();
  const [value, setValue] = useState<Date>(today);

  return (
    <div style={section}>
      <h2>Bounded selection</h2>
      <p style={note}>
        Limited to the next fortnight. Out-of-range days stay focusable so arrow
        navigation can cross them — they are marked <code>aria-disabled</code> rather
        than removed from the tab order.
      </p>
      <Calendar
        value={value}
        onChange={setValue}
        minDate={today}
        maxDate={addDays(today, 14)}
      />
    </div>
  );
}

// ─── 3. Picker with a text input ──────────────────────────────────────────────
function PickerExample() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div style={section}>
      <h2>DatePicker</h2>
      <DatePicker value={value ?? undefined} onChange={setValue} format="MM/DD/YYYY" />
      <p style={note}>
        Selected: <span style={mono}>{value ? formatDate(value, 'YYYY-MM-DD') : '(none)'}</span>
      </p>
    </div>
  );
}

// ─── 4. Parsing, including the values that must be rejected ───────────────────
function ParsingExample() {
  const samples = ['07/15/2026', '02/29/2024', '02/29/2026', '13/01/2026', '04/31/2026'];

  return (
    <div style={section}>
      <h2>parseDate</h2>
      <p style={note}>
        Impossible dates return <code>null</code> instead of silently rolling over into
        the next month.
      </p>
      <ul style={{ fontSize: '13px', lineHeight: 1.9 }}>
        {samples.map((s) => {
          const parsed = parseDate(s, 'MM/DD/YYYY');
          return (
            <li key={s}>
              <span style={mono}>{s}</span> →{' '}
              <span style={mono}>{parsed ? formatDate(parsed, 'YYYY-MM-DD') : 'null'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/date</h1>
      <p>Calendar and date picker with a real ARIA grid and roving keyboard focus.</p>
      <CalendarExample />
      <BoundedExample />
      <PickerExample />
      <ParsingExample />
    </div>
  );
}

export default Demo;

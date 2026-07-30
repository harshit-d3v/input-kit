import React, { useState } from 'react';
import {
  formatCurrency,
  formatCurrencyNumber,
  getCurrencySymbol,
  parseCurrency,
  convertCurrency,
  useCurrency,
} from '../src/index';

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
const cell: React.CSSProperties = { padding: '6px 12px', borderBottom: '1px solid #f3f4f6' };

const LOCALES: Array<{ locale: string; currency: string }> = [
  { locale: 'en-US', currency: 'USD' },
  { locale: 'de-DE', currency: 'EUR' },
  { locale: 'en-GB', currency: 'GBP' },
  { locale: 'ja-JP', currency: 'JPY' },
  { locale: 'ko-KR', currency: 'KRW' },
  { locale: 'en-IN', currency: 'INR' },
];

// ─── 1. Per-currency fraction digits ──────────────────────────────────────────
function FormattingExample() {
  const [amount, setAmount] = useState(1234.56);

  return (
    <div style={section}>
      <h2>Formatting</h2>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
        Amount
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        style={{ padding: '8px 12px', fontSize: '15px', width: '200px' }}
      />
      <table style={{ marginTop: '1rem', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: 'left' }}>Locale</th>
            <th style={{ ...cell, textAlign: 'left' }}>Symbol</th>
            <th style={{ ...cell, textAlign: 'left' }}>Formatted</th>
            <th style={{ ...cell, textAlign: 'left' }}>Number only</th>
          </tr>
        </thead>
        <tbody>
          {LOCALES.map(({ locale, currency }) => (
            <tr key={locale}>
              <td style={cell}>
                <span style={mono}>{locale}</span>
              </td>
              <td style={cell}>{getCurrencySymbol(currency, locale)}</td>
              <td style={cell}>{formatCurrency(amount, { locale, currency })}</td>
              <td style={cell}>{formatCurrencyNumber(amount, { locale })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={note}>
        Fraction digits follow the currency: yen and won have no minor unit, so they
        render without decimals rather than being forced to two.
      </p>
    </div>
  );
}

// ─── 2. Parsing back, locale-aware ────────────────────────────────────────────
function ParsingExample() {
  const [text, setText] = useState('1.234,56 €');
  const [locale, setLocale] = useState('de-DE');

  return (
    <div style={section}>
      <h2>Parsing</h2>
      <p style={note}>
        Pass the locale the string was formatted in — otherwise a comma decimal
        separator is read as a thousands separator.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '15px', flex: 1, minWidth: '200px' }}
        />
        <select value={locale} onChange={(e) => setLocale(e.target.value)} style={{ padding: '8px' }}>
          {LOCALES.map(({ locale: l }) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <p style={note}>
        Parsed: <span style={mono}>{parseCurrency(text, locale)}</span> · without a
        locale: <span style={mono}>{parseCurrency(text)}</span>
      </p>
    </div>
  );
}

// ─── 3. Conversion with a caller-supplied rate table ──────────────────────────
function ConversionExample() {
  // Rates belong to the caller — the built-in table is a fixed snapshot and will be
  // out of date.
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 157 };

  return (
    <div style={section}>
      <h2>Conversion</h2>
      <p style={note}>
        Supply your own rate table, keyed by units-per-USD. 100 USD becomes:
      </p>
      <ul style={{ fontSize: '14px', lineHeight: 1.9 }}>
        {Object.keys(rates)
          .filter((c) => c !== 'USD')
          .map((to) => (
            <li key={to}>
              {formatCurrency(convertCurrency(100, 'USD', to, rates), { currency: to })}
            </li>
          ))}
      </ul>
    </div>
  );
}

// ─── 4. The hook ──────────────────────────────────────────────────────────────
function HookExample() {
  const eur = useCurrency({ currency: 'EUR', locale: 'de-DE' });

  return (
    <div style={section}>
      <h2>useCurrency</h2>
      <p style={note}>
        Bound to one locale and currency: symbol <span style={mono}>{eur.symbol}</span>,
        formatted <span style={mono}>{eur.format(4999.5)}</span>, round-tripped{' '}
        <span style={mono}>{eur.parse(eur.format(4999.5))}</span>
      </p>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/currency</h1>
      <p>Locale-aware currency formatting, parsing and conversion.</p>
      <FormattingExample />
      <ParsingExample />
      <ConversionExample />
      <HookExample />
    </div>
  );
}

export default Demo;

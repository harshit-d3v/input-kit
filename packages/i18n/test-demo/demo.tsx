import React, { useMemo, useState } from 'react';
import {
  I18nProvider,
  useI18n,
  useTranslation,
  Trans,
  LocaleSwitcher,
  mergeMessages,
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

// Two "files", merged — the deep merge keeps both namespaces intact.
const base = {
  en: { nav: { home: 'Home' }, greeting: 'Hello, {{name}}' },
  ru: { nav: { home: 'Главная' }, greeting: 'Привет, {{name}}' },
  pl: { nav: { home: 'Strona główna' }, greeting: 'Cześć, {{name}}' },
  ar: { nav: { home: 'الرئيسية' }, greeting: 'مرحبا، {{name}}' },
};

const counts = {
  en: { items: '{{count}} item | {{count}} items' },
  ru: { items: '{{count}} товар | {{count}} товара | {{count}} товаров' },
  pl: { items: '{{count}} plik | {{count}} pliki | {{count}} plików' },
  ar: { items: '{{count}} عنصر | {{count}} عنصران | {{count}} عناصر' },
};

const messages = mergeMessages(base, counts);

function Panel() {
  const { t, locale, isRTL, formatNumber, formatDate, formatCurrency } = useI18n();
  const [count, setCount] = useState(1);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <LocaleSwitcher />
        <span style={note}>
          active: <span style={mono}>{locale}</span> · direction:{' '}
          <span style={mono}>{isRTL ? 'rtl' : 'ltr'}</span>
        </span>
      </div>

      <h3 style={{ fontSize: '14px', marginTop: '1.5rem' }}>Translation</h3>
      <p>
        <Trans i18nKey="nav.home" /> — <Trans i18nKey="greeting" params={{ name: 'Ada' }} />
      </p>

      <h3 style={{ fontSize: '14px', marginTop: '1.5rem' }}>Pluralisation</h3>
      <p style={note}>
        Forms are chosen by <code>Intl.PluralRules</code> for the active locale, not by
        an English <code>count === 1</code> rule. Russian and Polish take the singular
        form again at 21, 31, 41 and so on.
      </p>
      <input
        type="range"
        min={0}
        max={30}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        style={{ width: '260px' }}
      />
      <p style={{ fontSize: '18px' }}>{t('items', { count })}</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[0, 1, 2, 5, 21, 22, 25].map((n) => (
          <button key={n} onClick={() => setCount(n)} style={{ cursor: 'pointer', padding: '2px 10px' }}>
            {n}
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: '14px', marginTop: '1.5rem' }}>Formatters</h3>
      <ul style={{ fontSize: '14px', lineHeight: 1.9 }}>
        <li>number: {formatNumber(1234567.891)}</li>
        <li>currency: {formatCurrency(1234.5, 'EUR')}</li>
        <li>date: {formatDate(new Date(2026, 6, 31), { dateStyle: 'long' })}</li>
      </ul>
    </div>
  );
}

function MissingKeyExample() {
  const { t } = useTranslation();
  return (
    <p style={note}>
      An unknown key falls back to the key itself: <span style={mono}>{t('nope.missing')}</span>
    </p>
  );
}

export function Demo() {
  const [locale, setLocale] = useState('en');
  const config = useMemo(
    () => ({ locale, messages, fallbackLocale: 'en' }),
    [locale]
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/i18n</h1>
      <p>Translation, CLDR pluralisation, RTL detection and Intl formatters.</p>
      <div style={section}>
        <h2>Provider</h2>
        <p style={note}>
          Switch locale below. <code>config</code> is memoised so the context value is
          stable between renders.
        </p>
        <I18nProvider config={config}>
          <Panel />
          <MissingKeyExample />
        </I18nProvider>
        <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
          {Object.keys(messages).map((l) => (
            <button key={l} onClick={() => setLocale(l)} style={{ cursor: 'pointer', padding: '4px 12px' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Demo;

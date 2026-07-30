import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nProvider, useI18n, mergeMessages, detectBrowserLocale } from './index';

const withProvider = (locale: string, messages: Record<string, any>, fallbackLocale?: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider config={{ locale, messages, fallbackLocale }}>{children}</I18nProvider>
  );
  return renderHook(() => useI18n(), { wrapper }).result;
};

describe('translation lookup', () => {
  it('resolves nested keys', () => {
    const r = withProvider('en', { en: { nav: { home: 'Home' } } });
    expect(r.current.t('nav.home')).toBe('Home');
  });

  it('falls back to the fallback locale', () => {
    const r = withProvider('fr', { fr: {}, en: { greeting: 'Hello' } }, 'en');
    expect(r.current.t('greeting')).toBe('Hello');
  });

  it('returns the key when nothing matches', () => {
    const r = withProvider('en', { en: {} });
    expect(r.current.t('missing.key')).toBe('missing.key');
  });

  it('interpolates parameters', () => {
    const r = withProvider('en', { en: { hi: 'Hi {{name}}' } });
    expect(r.current.t('hi', { name: 'Ada' })).toBe('Hi Ada');
  });
});

describe('pluralisation', () => {
  // Intl.PluralRules was constructed and then ignored: the two- and three-form
  // branches hardcoded `count === 1`, which is English's rule.
  it('selects English forms', () => {
    const r = withProvider('en', { en: { items: 'item | items' } });
    expect(r.current.t('items', { count: 1 })).toBe('item');
    expect(r.current.t('items', { count: 0 })).toBe('items');
    expect(r.current.t('items', { count: 5 })).toBe('items');
  });

  it('follows CLDR categories for Russian, where 21 takes the singular form', () => {
    const r = withProvider('ru', { ru: { items: 'товар | товара | товаров' } });
    expect(r.current.t('items', { count: 1 })).toBe('товар');
    expect(r.current.t('items', { count: 21 })).toBe('товар');
    expect(r.current.t('items', { count: 2 })).toBe('товара');
    expect(r.current.t('items', { count: 5 })).toBe('товаров');
  });

  it('follows Polish categories', () => {
    const r = withProvider('pl', { pl: { f: 'plik | pliki | plików' } });
    expect(r.current.t('f', { count: 1 })).toBe('plik');
    expect(r.current.t('f', { count: 2 })).toBe('pliki');
    expect(r.current.t('f', { count: 5 })).toBe('plików');
  });

  // Splitting on `|` unconditionally mangled any translation that merely contained
  // one: "Home | Docs | API" with count 2 returned "Docs".
  it('leaves a pipe-free string alone even when count is passed', () => {
    const r = withProvider('en', { en: { title: 'Dashboard' } });
    expect(r.current.t('title', { count: 3 })).toBe('Dashboard');
  });

  it('interpolates the count into the chosen form', () => {
    const r = withProvider('en', { en: { n: '{{count}} item | {{count}} items' } });
    expect(r.current.t('n', { count: 1 })).toBe('1 item');
    expect(r.current.t('n', { count: 7 })).toBe('7 items');
  });
});

describe('mergeMessages', () => {
  // A one-level spread is the wrong shape for the thing it exists to merge:
  // translation files are nested by namespace.
  it('merges namespaces deeply instead of replacing them', () => {
    const merged = mergeMessages(
      { en: { common: { yes: 'Yes' } } },
      { en: { common: { no: 'No' } } }
    );
    expect(merged.en.common).toEqual({ yes: 'Yes', no: 'No' });
  });

  it('merges across locales', () => {
    const merged = mergeMessages({ en: { a: '1' } }, { fr: { a: 'un' } });
    expect(Object.keys(merged).sort()).toEqual(['en', 'fr']);
  });

  it('lets later sets win on a leaf conflict', () => {
    const merged = mergeMessages({ en: { k: 'first' } }, { en: { k: 'second' } });
    expect(merged.en.k).toBe('second');
  });

  it('merges more than two levels down', () => {
    const merged = mergeMessages(
      { en: { a: { b: { c: '1' } } } },
      { en: { a: { b: { d: '2' } } } }
    );
    expect(merged.en.a).toEqual({ b: { c: '1', d: '2' } });
  });

  it('does not mutate its inputs', () => {
    const first = { en: { common: { yes: 'Yes' } } };
    mergeMessages(first, { en: { common: { no: 'No' } } });
    expect(first.en.common).toEqual({ yes: 'Yes' });
  });
});

describe('detectBrowserLocale', () => {
  it('falls back when nothing is supported', () => {
    expect(detectBrowserLocale(['zz'], 'en')).toBe('en');
  });

  it('returns a supported locale when one matches', () => {
    const langs = Array.from(navigator.languages ?? [navigator.language]);
    const base = (langs[0] ?? 'en-US').split('-')[0];
    expect(detectBrowserLocale([base], 'xx')).toBe(base);
  });
});

describe('formatters', () => {
  it('formats numbers, currency and dates for the active locale', () => {
    const r = withProvider('en-US', { 'en-US': {} });
    expect(r.current.formatNumber(1234.5)).toBe('1,234.5');
    expect(r.current.formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
    expect(typeof r.current.formatDate(new Date(2026, 0, 1))).toBe('string');
  });

  it('reports RTL for Arabic and Hebrew only', () => {
    expect(withProvider('ar', { ar: {} }).current.isRTL).toBe(true);
    expect(withProvider('he-IL', { 'he-IL': {} }).current.isRTL).toBe(true);
    expect(withProvider('en', { en: {} }).current.isRTL).toBe(false);
  });
});

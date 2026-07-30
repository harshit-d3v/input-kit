import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyNumber,
  getCurrencySymbol,
  parseCurrency,
  convertCurrency,
} from './index';

describe('formatCurrency', () => {
  it('formats USD with two decimals', () => {
    expect(formatCurrency(1234.5, { currency: 'USD', locale: 'en-US' })).toBe('$1,234.50');
  });

  // defaultOptions pinned fraction digits to 2, overriding the per-currency defaults
  // Intl applies. Yen has no minor unit.
  it.each([
    ['JPY', 'ja-JP'],
    ['KRW', 'ko-KR'],
  ])('gives %s no decimal places', (currency, locale) => {
    const out = formatCurrency(1234, { currency, locale });
    expect(out).not.toMatch(/[.,]00/);
    expect(out).toContain('1,234');
  });

  it('still honours explicit fraction digits', () => {
    expect(
      formatCurrency(1234, {
        currency: 'JPY',
        locale: 'ja-JP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    ).toMatch(/1,234\.00/);
  });

  it('formats without a symbol via formatCurrencyNumber', () => {
    expect(formatCurrencyNumber(1234.5, { locale: 'en-US' })).toBe('1,234.5');
  });
});

describe('getCurrencySymbol', () => {
  it('returns the symbol for a known currency', () => {
    expect(getCurrencySymbol('USD', 'en-US')).toBe('$');
    expect(getCurrencySymbol('EUR', 'de-DE')).toBe('€');
  });

  // Intl throws RangeError on an unknown code; the `|| currency` fallback implied
  // this was already safe.
  it('falls back to the code instead of throwing on an unknown currency', () => {
    expect(() => getCurrencySymbol('XYZ', 'en-US')).not.toThrow();
    expect(getCurrencySymbol('XYZ', 'en-US')).toBe('XYZ');
  });

  it('does not throw on a malformed locale', () => {
    expect(() => getCurrencySymbol('USD', 'not-a-locale!!')).not.toThrow();
  });
});

describe('parseCurrency', () => {
  it('parses en-US output', () => {
    expect(parseCurrency('$1,234.56')).toBeCloseTo(1234.56);
  });

  // The old implementation stripped everything but [\d.-], so the German output
  // "1.234,56 €" parsed to 1.234 — three orders of magnitude out.
  it('round-trips de-DE output when given the locale', () => {
    const formatted = formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' });
    expect(parseCurrency(formatted, 'de-DE')).toBeCloseTo(1234.56);
  });

  it('round-trips en-US output', () => {
    const formatted = formatCurrency(9876.54, { locale: 'en-US', currency: 'USD' });
    expect(parseCurrency(formatted, 'en-US')).toBeCloseTo(9876.54);
  });

  it('handles negatives', () => {
    expect(parseCurrency('-$1,234.56')).toBeCloseTo(-1234.56);
  });

  it('reads accounting parentheses as negative', () => {
    expect(parseCurrency('($1,234.56)')).toBeCloseTo(-1234.56);
  });

  it('returns 0 for unparseable input rather than NaN', () => {
    expect(parseCurrency('')).toBe(0);
    expect(parseCurrency('abc')).toBe(0);
  });
});

describe('convertCurrency', () => {
  it('accepts a caller-supplied rate table', () => {
    const rates = { USD: 1, EUR: 2 };
    expect(convertCurrency(10, 'USD', 'EUR', rates)).toBeCloseTo(20);
    expect(convertCurrency(10, 'EUR', 'USD', rates)).toBeCloseTo(5);
  });

  it('is case-insensitive on codes', () => {
    const rates = { USD: 1, EUR: 2 };
    expect(convertCurrency(10, 'usd', 'eur', rates)).toBeCloseTo(20);
  });

  it('throws on a currency missing from the table', () => {
    expect(() => convertCurrency(10, 'USD', 'ZZZ', { USD: 1 })).toThrow();
  });
});

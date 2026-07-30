// @input-kit/currency - Currency formatting utilities

import { useMemo } from 'react';

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  style?: 'symbol' | 'code' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Fraction digits are deliberately absent. Pinning them to 2 overrode the
// per-currency defaults Intl applies, so zero-decimal currencies came out wrong:
// formatCurrency(1234, { currency: 'JPY' }) rendered "¥1,234.00", and yen has no
// minor unit. Same for KRW, VND and CLP. Callers can still pass them explicitly.
const defaultOptions: CurrencyOptions = {
  currency: 'USD',
  locale: 'en-US',
  style: 'symbol',
};

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  options: CurrencyOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  
  const formatter = new Intl.NumberFormat(opts.locale, {
    style: 'currency',
    currency: opts.currency,
    currencyDisplay: opts.style,
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits,
  });

  return formatter.format(amount);
}

/**
 * Format currency without symbol (just the number)
 */
export function formatCurrencyNumber(
  amount: number,
  options: CurrencyOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  
  const formatter = new Intl.NumberFormat(opts.locale, {
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits,
  });

  return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  // Intl throws RangeError on an unknown currency code. The `|| currency` fallback
  // below always implied this was safe; now it is.
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    });

    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart?.value || currency;
  } catch {
    return currency;
  }
}

/**
 * Parse a formatted currency string back to a number.
 *
 * Pass the same `locale` used to format it. Without one this assumes `.` is the
 * decimal separator, which silently mangled every locale that uses `,` — the
 * de-DE output "1.234,56 €" parsed to 1.234, three orders of magnitude out.
 */
export function parseCurrency(value: string, locale?: string): number {
  let decimalSeparator = '.';

  if (locale) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
    decimalSeparator = parts.find(part => part.type === 'decimal')?.value ?? '.';
  }

  // Accounting notation wraps negatives in parentheses.
  const isNegative = /^\s*\(.*\)\s*$/.test(value) || value.includes('-');

  const groupingStripped = decimalSeparator === ','
    ? value.replace(/\./g, '').replace(/,/g, '.')
    : value.replace(/,/g, '');

  const cleaned = groupingStripped.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);

  if (Number.isNaN(parsed)) return 0;
  return isNegative ? -parsed : parsed;
}

/**
 * Illustrative exchange rates, fixed at roughly 2021 levels.
 *
 * @deprecated These are static and years out of date — never use them for anything
 * that matters. Pass your own table to {@link convertCurrency} instead.
 */
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.5,
  BRL: 5.25,
};

/**
 * Convert between currencies.
 *
 * Supply `rates` — a map of currency code to units-per-USD — for anything real. The
 * built-in table is a fixed 2021 snapshot kept only so the signature stays usable in
 * examples, and it will be wrong.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = exchangeRates
): number {
  const fromRate = rates[from.toUpperCase()];
  const toRate = rates[to.toUpperCase()];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${from} or ${to}`);
  }


  const inUSD = amount / fromRate;
  return inUSD * toRate;
}

/**
 * React hook for currency formatting
 */
export function useCurrency(options: CurrencyOptions = {}) {
  // Memoised on the individual fields rather than on `options`, which is normally an
  // inline literal. Previously every render built a fresh Intl.NumberFormat (via
  // getCurrencySymbol, called in the render body) and returned new function
  // identities, re-rendering every memoised consumer.
  const { currency, locale, style, minimumFractionDigits, maximumFractionDigits } = options;

  return useMemo(() => {
    const resolved: CurrencyOptions = {
      currency,
      locale,
      style,
      minimumFractionDigits,
      maximumFractionDigits,
    };

    return {
      format: (amount: number) => formatCurrency(amount, resolved),
      formatNumber: (amount: number) => formatCurrencyNumber(amount, resolved),
      symbol: getCurrencySymbol(currency, locale),
      parse: (value: string) => parseCurrency(value, locale),
    };
  }, [currency, locale, style, minimumFractionDigits, maximumFractionDigits]);
}

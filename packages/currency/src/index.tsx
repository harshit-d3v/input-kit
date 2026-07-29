// @input-kit/currency - Currency formatting utilities

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  style?: 'symbol' | 'code' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const defaultOptions: CurrencyOptions = {
  currency: 'USD',
  locale: 'en-US',
  style: 'symbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });
  
  const parts = formatter.formatToParts(0);
  const symbolPart = parts.find(part => part.type === 'currency');
  return symbolPart?.value || currency;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Convert between currencies (static rates)
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

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  const fromRate = exchangeRates[from.toUpperCase()];
  const toRate = exchangeRates[to.toUpperCase()];
  
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
  const format = (amount: number) => formatCurrency(amount, options);
  const formatNumber = (amount: number) => formatCurrencyNumber(amount, options);
  const symbol = getCurrencySymbol(options.currency, options.locale);
  
  return { format, formatNumber, symbol, parse: parseCurrency };
}

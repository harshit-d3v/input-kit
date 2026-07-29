import type { NumberInputOptions } from './types';

/**
 * Get the browser locale
 */
export function getDefaultLocale(): string {
  return typeof navigator !== 'undefined' 
    ? navigator.language || 'en-US'
    : 'en-US';
}

/**
 * Parse a formatted number string to a number
 */
export function parseNumber(
  value: string,
  locale: string | string[] = getDefaultLocale()
): number | null {
  if (!value || value.trim() === '') return null;
  
  // Remove currency symbols and non-numeric characters except decimal separator
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  const decimalPart = parts.find(p => p.type === 'decimal');
  const decimalSeparator = decimalPart?.value || '.';
  
  // Normalize the string
  let normalized = value.trim();
  
  // Handle negative numbers
  const isNegative = normalized.includes('-') || 
    (normalized.includes('(') && normalized.includes(')'));
  
  // Remove all non-digit characters except the decimal separator
  const escapedSeparator = decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`[^\\d${escapedSeparator}-]`, 'g');
  normalized = normalized.replace(regex, '');
  
  // Replace locale decimal separator with standard dot
  if (decimalSeparator !== '.') {
    normalized = normalized.replace(decimalSeparator, '.');
  }
  
  // Handle multiple decimal separators (keep first)
  const parts_split = normalized.split('.');
  if (parts_split.length > 2) {
    normalized = parts_split[0] + '.' + parts_split.slice(1).join('');
  }
  
  const num = parseFloat(normalized);
  
  if (isNaN(num)) return null;
  
  return isNegative ? -Math.abs(num) : num;
}

/**
 * Format a number according to locale and options
 */
export function formatNumber(
  value: number | null,
  options: NumberInputOptions = {}
): string {
  if (value === null || isNaN(value)) return '';
  
  const {
    format = 'decimal',
    locale = getDefaultLocale(),
    decimals,
    currency = 'USD',
    currencyDisplay = 'symbol',
  } = options;
  
  const formatOptions: Intl.NumberFormatOptions = {};
  
  if (format === 'currency') {
    formatOptions.style = 'currency';
    formatOptions.currency = currency;
    formatOptions.currencyDisplay = currencyDisplay;
  } else if (format === 'percent') {
    formatOptions.style = 'percent';
  } else if (format === 'decimal') {
    formatOptions.style = 'decimal';
  }
  
  if (decimals !== undefined) {
    formatOptions.minimumFractionDigits = decimals;
    formatOptions.maximumFractionDigits = decimals;
  }
  
  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined) value = Math.max(value, min);
  if (max !== undefined) value = Math.min(value, max);
  return value;
}

/**
 * Round a number to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Increment a value by step
 */
export function incrementValue(
  value: number | null,
  step: number = 1,
  min?: number,
  max?: number,
  decimals?: number
): number {
  const current = value ?? min ?? 0;
  let next = current + step;
  next = clamp(next, min, max);
  if (decimals !== undefined) {
    next = roundToDecimals(next, decimals);
  }
  return next;
}

/**
 * Decrement a value by step
 */
export function decrementValue(
  value: number | null,
  step: number = 1,
  min?: number,
  max?: number,
  decimals?: number
): number {
  const current = value ?? max ?? 0;
  let next = current - step;
  next = clamp(next, min, max);
  if (decimals !== undefined) {
    next = roundToDecimals(next, decimals);
  }
  return next;
}

/**
 * Validate a number value
 */
export function validateNumber(
  value: number | null,
  min?: number,
  max?: number,
  allowNegative: boolean = true,
  allowEmpty: boolean = true
): { isValid: boolean; error: string | null } {
  if (value === null) {
    return {
      isValid: allowEmpty,
      error: allowEmpty ? null : 'Value is required',
    };
  }
  
  if (isNaN(value)) {
    return { isValid: false, error: 'Invalid number' };
  }
  
  if (!allowNegative && value < 0) {
    return { isValid: false, error: 'Negative numbers are not allowed' };
  }
  
  if (min !== undefined && value < min) {
    return { isValid: false, error: `Minimum value is ${min}` };
  }
  
  if (max !== undefined && value > max) {
    return { isValid: false, error: `Maximum value is ${max}` };
  }
  
  return { isValid: true, error: null };
}

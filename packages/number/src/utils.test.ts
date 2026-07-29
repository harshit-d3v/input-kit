import { describe, it, expect } from 'vitest';
import {
  parseNumber,
  formatNumber,
  clamp,
  roundToDecimals,
  incrementValue,
  decrementValue,
  validateNumber,
} from './utils';

describe('parseNumber', () => {
  it('should parse simple numbers', () => {
    expect(parseNumber('123', 'en-US')).toBe(123);
    expect(parseNumber('123.45', 'en-US')).toBe(123.45);
  });

  it('should parse negative numbers', () => {
    expect(parseNumber('-123', 'en-US')).toBe(-123);
    expect(parseNumber('(123)', 'en-US')).toBe(-123);
  });

  it('should handle empty strings', () => {
    expect(parseNumber('', 'en-US')).toBeNull();
    expect(parseNumber('   ', 'en-US')).toBeNull();
  });

  it('should handle invalid input', () => {
    expect(parseNumber('abc', 'en-US')).toBeNull();
    expect(parseNumber('---', 'en-US')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('should format decimal numbers', () => {
    expect(formatNumber(1234.5, { format: 'decimal', locale: 'en-US' }))
      .toBe('1,234.5');
  });

  it('should format currency', () => {
    expect(formatNumber(1234.5, { format: 'currency', currency: 'USD', locale: 'en-US' }))
      .toBe('$1,234.50');
  });

  it('should format percentages', () => {
    expect(formatNumber(0.15, { format: 'percent', locale: 'en-US' }))
      .toBe('15%');
  });

  it('should handle null values', () => {
    expect(formatNumber(null)).toBe('');
  });

  it('should respect decimal places', () => {
    expect(formatNumber(1234.567, { decimals: 2, locale: 'en-US' }))
      .toBe('1,234.57');
  });
});

describe('clamp', () => {
  it('should clamp to min', () => {
    expect(clamp(5, 10, 20)).toBe(10);
  });

  it('should clamp to max', () => {
    expect(clamp(25, 10, 20)).toBe(20);
  });

  it('should return value if within range', () => {
    expect(clamp(15, 10, 20)).toBe(15);
  });

  it('should handle undefined bounds', () => {
    expect(clamp(5, undefined, 10)).toBe(5);
    expect(clamp(5, 0, undefined)).toBe(5);
    expect(clamp(5, undefined, undefined)).toBe(5);
  });
});

describe('roundToDecimals', () => {
  it('should round to specified decimals', () => {
    expect(roundToDecimals(1.234, 2)).toBe(1.23);
    expect(roundToDecimals(1.235, 2)).toBe(1.24);
  });

  it('should handle zero decimals', () => {
    expect(roundToDecimals(1.9, 0)).toBe(2);
  });
});

describe('incrementValue', () => {
  it('should increment by step', () => {
    expect(incrementValue(10, 5)).toBe(15);
  });

  it('should respect max', () => {
    expect(incrementValue(18, 5, undefined, 20)).toBe(20);
  });

  it('should use min as default when value is null', () => {
    expect(incrementValue(null, 5, 10)).toBe(15);
  });

  it('should use 0 as default when no min', () => {
    expect(incrementValue(null, 5)).toBe(5);
  });
});

describe('decrementValue', () => {
  it('should decrement by step', () => {
    expect(decrementValue(10, 5)).toBe(5);
  });

  it('should respect min', () => {
    expect(decrementValue(7, 5, 5)).toBe(5);
  });

  it('should use max as default when value is null', () => {
    expect(decrementValue(null, 5, undefined, 100)).toBe(95);
  });
});

describe('validateNumber', () => {
  it('should validate null when allowed', () => {
    const result = validateNumber(null, undefined, undefined, true, true);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should invalidate null when not allowed', () => {
    const result = validateNumber(null, undefined, undefined, true, false);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Value is required');
  });

  it('should validate within range', () => {
    expect(validateNumber(15, 10, 20).isValid).toBe(true);
  });

  it('should invalidate below min', () => {
    const result = validateNumber(5, 10, 20);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Minimum value is 10');
  });

  it('should invalidate above max', () => {
    const result = validateNumber(25, 10, 20);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Maximum value is 20');
  });

  it('should validate negative when allowed', () => {
    expect(validateNumber(-5, undefined, undefined, true).isValid).toBe(true);
  });

  it('should invalidate negative when not allowed', () => {
    const result = validateNumber(-5, undefined, undefined, false);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Negative numbers are not allowed');
  });
});

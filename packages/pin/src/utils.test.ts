import { describe, it, expect } from 'vitest';
import {
  isNumeric,
  isAlphanumeric,
  validateChar,
  filterValue,
  valueToArray,
  isCompleteValue,
  getNextEmptyIndex,
  getLastFilledIndex,
} from './utils';

describe('isNumeric', () => {
  it('returns true for digits', () => {
    expect(isNumeric('0')).toBe(true);
    expect(isNumeric('5')).toBe(true);
    expect(isNumeric('9')).toBe(true);
  });

  it('returns false for non-digits', () => {
    expect(isNumeric('a')).toBe(false);
    expect(isNumeric('A')).toBe(false);
    expect(isNumeric(' ')).toBe(false);
    expect(isNumeric('')).toBe(false);
    expect(isNumeric('12')).toBe(false);
  });
});

describe('isAlphanumeric', () => {
  it('returns true for letters and digits', () => {
    expect(isAlphanumeric('a')).toBe(true);
    expect(isAlphanumeric('Z')).toBe(true);
    expect(isAlphanumeric('0')).toBe(true);
    expect(isAlphanumeric('9')).toBe(true);
  });

  it('returns false for non-alphanumeric', () => {
    expect(isAlphanumeric(' ')).toBe(false);
    expect(isAlphanumeric('')).toBe(false);
    expect(isAlphanumeric('!')).toBe(false);
    expect(isAlphanumeric('@')).toBe(false);
  });
});

describe('validateChar', () => {
  it('validates numeric characters when alphanumeric is false', () => {
    expect(validateChar('5', { alphanumeric: false })).toBe(true);
    expect(validateChar('a', { alphanumeric: false })).toBe(false);
  });

  it('validates alphanumeric characters when alphanumeric is true', () => {
    expect(validateChar('5', { alphanumeric: true })).toBe(true);
    expect(validateChar('a', { alphanumeric: true })).toBe(true);
    expect(validateChar('Z', { alphanumeric: true })).toBe(true);
    expect(validateChar('!', { alphanumeric: true })).toBe(false);
  });

  it('uses custom validate function when provided', () => {
    const validate = (char: string) => char === 'X';
    expect(validateChar('X', { validate })).toBe(true);
    expect(validateChar('Y', { validate })).toBe(false);
  });
});

describe('filterValue', () => {
  it('filters numeric characters', () => {
    expect(filterValue('123abc', 4, { alphanumeric: false })).toBe('123');
  });

  it('filters alphanumeric characters', () => {
    expect(filterValue('abc123!@#', 6, { alphanumeric: true })).toBe('abc123');
  });

  it('respects length limit', () => {
    expect(filterValue('123456789', 4, { alphanumeric: false })).toBe('1234');
  });

  it('returns empty string for invalid input', () => {
    expect(filterValue('abc', 4, { alphanumeric: false })).toBe('');
  });
});

describe('valueToArray', () => {
  it('converts string to array', () => {
    expect(valueToArray('123', 4)).toEqual(['1', '2', '3', '']);
  });

  it('pads with empty strings', () => {
    expect(valueToArray('1', 4)).toEqual(['1', '', '', '']);
  });

  it('truncates if value is longer than length', () => {
    expect(valueToArray('12345', 3)).toEqual(['1', '2', '3']);
  });

  it('handles empty string', () => {
    expect(valueToArray('', 3)).toEqual(['', '', '']);
  });
});

describe('isCompleteValue', () => {
  it('returns true when all values are filled', () => {
    expect(isCompleteValue(['1', '2', '3'])).toBe(true);
  });

  it('returns false when any value is empty', () => {
    expect(isCompleteValue(['1', '', '3'])).toBe(false);
    expect(isCompleteValue(['', '', ''])).toBe(false);
  });
});

describe('getNextEmptyIndex', () => {
  it('returns the next empty index', () => {
    expect(getNextEmptyIndex(['1', '', '3'], 0)).toBe(1);
  });

  it('returns -1 when no empty index found', () => {
    expect(getNextEmptyIndex(['1', '2', '3'], 0)).toBe(-1);
  });

  it('respects start index', () => {
    expect(getNextEmptyIndex(['', '2', ''], 1)).toBe(2);
  });
});

describe('getLastFilledIndex', () => {
  it('returns the last filled index', () => {
    expect(getLastFilledIndex(['1', '2', ''])).toBe(1);
  });

  it('returns -1 when no values are filled', () => {
    expect(getLastFilledIndex(['', '', ''])).toBe(-1);
  });

  it('returns last index when all are filled', () => {
    expect(getLastFilledIndex(['1', '2', '3'])).toBe(2);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  defaultFilterFn,
  highlightMatch,
  debounce,
  getOptionValue,
  isOptionSelected,
  removeValueFromArray,
  generateId,
  createCreatableOption,
  scrollIntoView,
  findOptionIndexByValue,
} from './utils.js';
import type { ComboboxOption } from './types.js';

describe('defaultFilterFn', () => {
  const option: ComboboxOption<string> = { id: '1', label: 'Hello World' };

  it('returns true for empty input', () => {
    expect(defaultFilterFn(option, '')).toBe(true);
  });

  it('returns true for matching substring (case insensitive)', () => {
    expect(defaultFilterFn(option, 'hello')).toBe(true);
    expect(defaultFilterFn(option, 'WORLD')).toBe(true);
    expect(defaultFilterFn(option, 'lo wo')).toBe(true);
  });

  it('returns false for non-matching substring', () => {
    expect(defaultFilterFn(option, 'xyz')).toBe(false);
    expect(defaultFilterFn(option, 'foo')).toBe(false);
  });
});

describe('highlightMatch', () => {
  it('returns single segment for empty query', () => {
    const result = highlightMatch('Hello World', '');
    expect(result).toEqual([{ text: 'Hello World', isMatch: false }]);
  });

  it('highlights single match', () => {
    const result = highlightMatch('Hello World', 'lo');
    expect(result).toEqual([
      { text: 'Hel', isMatch: false },
      { text: 'lo', isMatch: true },
      { text: ' World', isMatch: false },
    ]);
  });

  it('highlights multiple matches', () => {
    const result = highlightMatch('banana', 'a');
    expect(result).toEqual([
      { text: 'b', isMatch: false },
      { text: 'a', isMatch: true },
      { text: 'n', isMatch: false },
      { text: 'a', isMatch: true },
      { text: 'n', isMatch: false },
      { text: 'a', isMatch: true },
    ]);
  });

  it('is case insensitive', () => {
    const result = highlightMatch('Hello World', 'HELLO');
    expect(result).toEqual([
      { text: 'Hello', isMatch: true },
      { text: ' World', isMatch: false },
    ]);
  });

  it('handles no match', () => {
    const result = highlightMatch('Hello', 'xyz');
    expect(result).toEqual([{ text: 'Hello', isMatch: false }]);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('arg1');
  });

  it('cancels previous call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    vi.advanceTimersByTime(50);
    debounced('second');
    vi.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });
});

describe('getOptionValue', () => {
  it('returns custom value when provided', () => {
    const option: ComboboxOption<number> = { id: '1', label: 'One', value: 100 };
    expect(getOptionValue(option)).toBe(100);
  });

  it('returns id when value is undefined', () => {
    const option: ComboboxOption<string> = { id: 'abc', label: 'ABC' };
    expect(getOptionValue(option)).toBe('abc');
  });
});

describe('isOptionSelected', () => {
  const option: ComboboxOption<string> = { id: '1', label: 'One', value: 'one' };

  it('returns false for null value', () => {
    expect(isOptionSelected(option, null)).toBe(false);
  });

  it('returns true for matching single value', () => {
    expect(isOptionSelected(option, 'one')).toBe(true);
  });

  it('returns false for non-matching single value', () => {
    expect(isOptionSelected(option, 'two')).toBe(false);
  });

  it('returns true for value in array', () => {
    expect(isOptionSelected(option, ['one', 'two'])).toBe(true);
  });

  it('returns false for value not in array', () => {
    expect(isOptionSelected(option, ['two', 'three'])).toBe(false);
  });

  it('handles object values', () => {
    const objOption: ComboboxOption<{ id: number }> = { 
      id: '1', 
      label: 'One', 
      value: { id: 1 } 
    };
    expect(isOptionSelected(objOption, { id: 1 })).toBe(true);
    expect(isOptionSelected(objOption, { id: 2 })).toBe(false);
  });
});

describe('removeValueFromArray', () => {
  it('removes matching value', () => {
    const result = removeValueFromArray([1, 2, 3], 2);
    expect(result).toEqual([1, 3]);
  });

  it('removes all matching values', () => {
    const result = removeValueFromArray([1, 2, 2, 3], 2);
    expect(result).toEqual([1, 3]);
  });

  it('returns unchanged array if value not found', () => {
    const result = removeValueFromArray([1, 2, 3], 4);
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('includes prefix when provided', () => {
    const id = generateId('test');
    expect(id.startsWith('test-')).toBe(true);
  });
});

describe('createCreatableOption', () => {
  it('creates option with default label', () => {
    const option = createCreatableOption('New Item');
    expect(option.id).toBe('__create__New Item');
    expect(option.label).toBe('Create "New Item"');
    expect(option.value).toBe('New Item');
  });

  it('creates option with custom label', () => {
    const customLabel = (input: string) => `Add ${input}`;
    const option = createCreatableOption('New Item', customLabel);
    expect(option.label).toBe('Add New Item');
  });
});

describe('findOptionIndexByValue', () => {
  const options: ComboboxOption<string>[] = [
    { id: '1', label: 'One', value: 'one' },
    { id: '2', label: 'Two', value: 'two' },
    { id: '3', label: 'Three', value: 'three' },
  ];

  it('finds index by value', () => {
    expect(findOptionIndexByValue(options, 'two')).toBe(1);
  });

  it('returns -1 for value not found', () => {
    expect(findOptionIndexByValue(options, 'four')).toBe(-1);
  });
});

describe('scrollIntoView', () => {
  it('scrolls element into view', () => {
    const element = {
      getBoundingClientRect: () => ({ top: 100, bottom: 150 }),
    } as HTMLElement;
    
    const container = {
      getBoundingClientRect: () => ({ top: 50, bottom: 120 }),
      scrollTop: 0,
    } as unknown as HTMLElement;

    scrollIntoView(element, container);
    expect(container.scrollTop).toBe(30);
  });
});

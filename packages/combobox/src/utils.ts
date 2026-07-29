import type { ComboboxOption, HighlightMatch } from './types.js';

/**
 * Default filter function - case-insensitive substring match
 */
export function defaultFilterFn<T>(option: ComboboxOption<T>, inputValue: string): boolean {
  if (!inputValue) return true;
  return option.label.toLowerCase().includes(inputValue.toLowerCase());
}

/**
 * Highlight matching text in a string
 * Returns an array of { text, isMatch } segments
 */
export function highlightMatch(text: string, query: string): HighlightMatch[] {
  if (!query) return [{ text, isMatch: false }];
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const result: HighlightMatch[] = [];
  
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery, lastIndex);
  
  while (index !== -1) {
    // Add non-matching text before match
    if (index > lastIndex) {
      result.push({
        text: text.slice(lastIndex, index),
        isMatch: false,
      });
    }
    
    // Add matching text
    result.push({
      text: text.slice(index, index + query.length),
      isMatch: true,
    });
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Add remaining non-matching text
  if (lastIndex < text.length) {
    result.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }
  
  return result;
}

/**
 * Debounce function for async operations
 */
export function debounce<T extends (...args: string[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Get option value (id or custom value)
 */
export function getOptionValue<T>(option: ComboboxOption<T>): T {
  return option.value !== undefined ? option.value : (option.id as T);
}

/**
 * Check if an option is selected
 */
export function isOptionSelected<T>(
  option: ComboboxOption<T>,
  value: T | T[] | null
): boolean {
  if (value === null) return false;
  
  const optionValue = getOptionValue(option);
  
  if (Array.isArray(value)) {
    return value.some(v => areValuesEqual(v, optionValue));
  }
  
  return areValuesEqual(value, optionValue);
}

/**
 * Deep equality check for values
 */
function areValuesEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
    return a === b;
  }
  // For objects, do simple JSON comparison (sufficient for most use cases)
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Remove a value from an array
 */
export function removeValueFromArray<T>(array: T[], value: T): T[] {
  return array.filter(item => !areValuesEqual(item, value));
}

/**
 * Generate unique ID
 */
let idCounter = 0;
export function generateId(prefix = 'combobox'): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

/**
 * Scroll element into view within container
 */
export function scrollIntoView(
  element: HTMLElement,
  container: HTMLElement
): void {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  if (elementRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - elementRect.top;
  } else if (elementRect.bottom > containerRect.bottom) {
    container.scrollTop += elementRect.bottom - containerRect.bottom;
  }
}

/**
 * Find option index by value
 */
export function findOptionIndexByValue<T>(
  options: ComboboxOption<T>[],
  value: T
): number {
  return options.findIndex(option => areValuesEqual(getOptionValue(option), value));
}

/**
 * Create a creatable option
 */
export function createCreatableOption<T>(
  inputValue: string,
  createLabel?: (inputValue: string) => string
): ComboboxOption<T> {
  return {
    id: `__create__${inputValue}`,
    label: createLabel ? createLabel(inputValue) : `Create "${inputValue}"`,
    value: inputValue as T,
  };
}

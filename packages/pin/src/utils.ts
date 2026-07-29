/**
 * Check if a character is a numeric digit
 */
export function isNumeric(char: string): boolean {
  return /^\d$/.test(char);
}

/**
 * Check if a character is alphanumeric
 */
export function isAlphanumeric(char: string): boolean {
  return /^[a-zA-Z0-9]$/.test(char);
}

/**
 * Validate a character based on the input type
 */
export function validateChar(
  char: string,
  options: { alphanumeric?: boolean; validate?: (char: string) => boolean }
): boolean {
  if (options.validate) {
    return options.validate(char);
  }
  
  if (options.alphanumeric) {
    return isAlphanumeric(char);
  }
  
  return isNumeric(char);
}

/**
 * Filter and validate a string based on the input type
 */
export function filterValue(
  value: string,
  length: number,
  options: { alphanumeric?: boolean; validate?: (char: string) => boolean }
): string {
  const chars = value.split('');
  const filtered: string[] = [];
  
  for (const char of chars) {
    if (validateChar(char, options)) {
      filtered.push(char);
      if (filtered.length >= length) {
        break;
      }
    }
  }
  
  return filtered.join('');
}

/**
 * Convert a string to an array of characters, padded with empty strings
 */
export function valueToArray(value: string, length: number): string[] {
  const chars = value.split('');
  const result: string[] = [];
  
  for (let i = 0; i < length; i++) {
    result[i] = chars[i] ?? '';
  }
  
  return result;
}

/**
 * Check if all values are filled
 */
export function isCompleteValue(values: string[]): boolean {
  return values.every(v => v !== '');
}

/**
 * Get the next empty index
 */
export function getNextEmptyIndex(values: string[], startIndex: number = 0): number {
  for (let i = startIndex; i < values.length; i++) {
    if (values[i] === '') {
      return i;
    }
  }
  return -1;
}

/**
 * Get the last filled index
 */
export function getLastFilledIndex(values: string[]): number {
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== '') {
      return i;
    }
  }
  return -1;
}

/**
 * Select all text in an input element
 */
export function selectInputText(input: HTMLInputElement | null): void {
  if (input) {
    input.select();
  }
}

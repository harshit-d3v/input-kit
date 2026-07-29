import type { InputHTMLAttributes, Ref } from 'react';

export type NumberFormat = 'decimal' | 'currency' | 'percent' | 'unit';

export interface NumberInputOptions {
  /** Format style */
  format?: NumberFormat;
  /** Locale for formatting (default: browser locale) */
  locale?: string | string[];
  /** Minimum value allowed */
  min?: number;
  /** Maximum value allowed */
  max?: number;
  /** Step increment for arrow keys */
  step?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Currency code for currency format (e.g., 'USD', 'EUR') */
  currency?: string;
  /** Currency display style */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** Allow negative numbers */
  allowNegative?: boolean;
  /** Allow empty value */
  allowEmpty?: boolean;
  /** Custom formatter function */
  formatter?: (value: number | null) => string;
  /** Custom parser function */
  parser?: (value: string) => number | null;
}

export interface NumberInputState {
  /** Current numeric value */
  value: number | null;
  /** Formatted display value */
  formattedValue: string;
  /** Raw input value */
  inputValue: string;
  /** Whether the input is focused */
  isFocused: boolean;
  /** Whether the value is valid */
  isValid: boolean;
  /** Validation error message */
  error: string | null;
}

export interface NumberInputActions {
  /** Set value directly */
  setValue: (value: number | null) => void;
  /** Increment value by step */
  increment: () => void;
  /** Decrement value by step */
  decrement: () => void;
  /** Clear the input */
  clear: () => void;
  /** Focus the input */
  focus: () => void;
  /** Blur the input */
  blur: () => void;
}

export interface UseNumberInputReturn extends NumberInputState, NumberInputActions {
  /** Props to spread on the input element */
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref: Ref<HTMLInputElement>;
  };
}

export interface NumberInputProps extends NumberInputOptions {
  /** Controlled value */
  value?: number | null;
  /** Default value for uncontrolled mode */
  defaultValue?: number | null;
  /** Change handler */
  onChange?: (value: number | null) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Custom class name */
  className?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether input is read-only */
  readOnly?: boolean;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** aria-label for accessibility */
  'aria-label'?: string;
  /** aria-labelledby for accessibility */
  'aria-labelledby'?: string;
}

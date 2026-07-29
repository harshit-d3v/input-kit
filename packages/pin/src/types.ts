import type { InputHTMLAttributes } from 'react';

/**
 * Base props for PIN/OTP input
 */
export interface PinInputBaseProps {
  /** Number of input characters */
  length: number;
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when all inputs are filled */
  onComplete?: (value: string) => void;
  /** Whether to mask the input */
  mask?: boolean;
  /** Placeholder character for empty inputs */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Custom validation function */
  validate?: (char: string) => boolean;
  /** Custom class name for container */
  className?: string;
  /** Custom class name for each input */
  inputClassName?: string;
  /** Auto-focus the first input on mount */
  autoFocus?: boolean;
}

/**
 * Props for PIN input component
 */
export interface PinInputProps extends PinInputBaseProps {
  /** Input type - numeric only for PIN */
  type?: 'numeric';
}

/**
 * Props for OTP input component
 */
export interface OtpInputProps extends PinInputBaseProps {
  /** Whether to allow alphanumeric characters */
  alphanumeric?: boolean;
  /** Input type */
  type?: 'numeric' | 'alphanumeric';
}

/**
 * Options for usePinInput hook
 */
export interface UsePinInputOptions {
  /** Number of input characters */
  length: number;
  /** Current value */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when all inputs are filled */
  onComplete?: (value: string) => void;
  /** Whether to allow alphanumeric characters */
  alphanumeric?: boolean;
  /** Custom validation function */
  validate?: (char: string) => boolean;
  /** Auto-focus the first input on mount */
  autoFocus?: boolean;
}

/**
 * Return value of usePinInput hook
 */
export interface UsePinInputReturn {
  /** Array of individual character values */
  values: string[];
  /** Set a specific value at an index */
  setValue: (index: number, value: string) => void;
  /** Set the entire value */
  setValues: (value: string) => void;
  /** Clear all inputs */
  clear: () => void;
  /** Whether all inputs are filled */
  isComplete: boolean;
  /** Handlers for input elements */
  handlers: {
    /** Change handler for input */
    onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Key down handler for input */
    onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Paste handler for input */
    onPaste: (index: number, e: React.ClipboardEvent<HTMLInputElement>) => void;
    /** Focus handler for input */
    onFocus: (index: number, e: React.FocusEvent<HTMLInputElement>) => void;
  };
  /** Refs for input elements */
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  /** Focus a specific input */
  focusInput: (index: number) => void;
}

/**
 * Input props returned by the hook
 */
export interface PinInputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

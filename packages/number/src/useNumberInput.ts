import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import type { NumberInputOptions, UseNumberInputReturn } from './types';
import {
  getDefaultLocale,
  parseNumber,
  formatNumber,
  incrementValue,
  decrementValue,
  validateNumber,
} from './utils';

export function useNumberInput(
  options: NumberInputOptions & {
    value?: number | null;
    defaultValue?: number | null;
    onChange?: (value: number | null) => void;
    onBlur?: () => void;
    onFocus?: () => void;
  } = {}
): UseNumberInputReturn {
  const {
    value: controlledValue,
    defaultValue = null,
    onChange,
    onBlur,
    onFocus,
    locale = getDefaultLocale(),
    min,
    max,
    step = 1,
    decimals,
    format,
    currency,
    currencyDisplay,
    allowNegative = true,
    allowEmpty = true,
    formatter,
    parser,
  } = options;

  const isControlled = controlledValue !== undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Current value (controlled or uncontrolled)
  const value = isControlled ? controlledValue : internalValue;

  // Format options for display
  const formatOptions = useMemo(
    () => ({
      format,
      locale,
      decimals,
      currency,
      currencyDisplay,
    }),
    [format, locale, decimals, currency, currencyDisplay]
  );

  // Update input value when value changes (only when not focused)
  useEffect(() => {
    if (!isFocused) {
      const formatted = formatter
        ? formatter(value)
        : formatNumber(value, formatOptions);
      setInputValue(formatted);
    }
  }, [value, isFocused, formatter, formatOptions]);

  // Validation
  const { isValid, error } = useMemo(
    () => validateNumber(value, min, max, allowNegative, allowEmpty),
    [value, min, max, allowNegative, allowEmpty]
  );

  // Set value handler
  const setValue = useCallback(
    (newValue: number | null) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  // Increment handler
  const increment = useCallback(() => {
    const newValue = incrementValue(value, step, min, max, decimals);
    setValue(newValue);
  }, [value, step, min, max, decimals, setValue]);

  // Decrement handler
  const decrement = useCallback(() => {
    const newValue = decrementValue(value, step, min, max, decimals);
    setValue(newValue);
  }, [value, step, min, max, decimals, setValue]);

  // Clear handler
  const clear = useCallback(() => {
    setValue(allowEmpty ? null : min ?? 0);
    setInputValue('');
  }, [setValue, allowEmpty, min]);

  // Focus handler
  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Blur handler
  const blur = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      setInputValue(rawValue);

      const parsed = parser ? parser(rawValue) : parseNumber(rawValue, locale);
      
      if (parsed !== null) {
        const clamped = Math.min(Math.max(parsed, min ?? -Infinity), max ?? Infinity);
        const finalValue = decimals !== undefined 
          ? Math.round(clamped * Math.pow(10, decimals)) / Math.pow(10, decimals)
          : clamped;
        setValue(finalValue);
      } else if (allowEmpty && rawValue === '') {
        setValue(null);
      }
    },
    [locale, parser, min, max, decimals, allowEmpty, setValue]
  );

  // Handle focus
  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Select all text on focus for easy editing
      event.target.select();
      onFocus?.();
    },
    [onFocus]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Reformat on blur
    const formatted = formatter
      ? formatter(value)
      : formatNumber(value, formatOptions);
    setInputValue(formatted);
    onBlur?.();
  }, [value, formatter, formatOptions, onBlur]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          increment();
          break;
        case 'ArrowDown':
          event.preventDefault();
          decrement();
          break;
        case 'Home':
          if (min !== undefined) {
            event.preventDefault();
            setValue(min);
          }
          break;
        case 'End':
          if (max !== undefined) {
            event.preventDefault();
            setValue(max);
          }
          break;
      }
    },
    [increment, decrement, min, max, setValue]
  );

  // Formatted display value
  const formattedValue = useMemo(
    () => (formatter ? formatter(value) : formatNumber(value, formatOptions)),
    [value, formatter, formatOptions]
  );

  return {
    // State
    value,
    formattedValue,
    inputValue,
    isFocused,
    isValid,
    error,
    // Actions
    setValue,
    increment,
    decrement,
    clear,
    focus,
    blur,
    // Input props
    inputProps: {
      ref: inputRef,
      value: inputValue,
      onChange: handleInputChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      type: 'text',
      inputMode: 'decimal',
      autoComplete: 'off',
      autoCorrect: 'off',
      spellCheck: false,
      'aria-invalid': isValid ? undefined : true,
    },
  };
}

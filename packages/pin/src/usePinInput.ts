import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UsePinInputOptions, UsePinInputReturn } from './types';
import {
  filterValue,
  isCompleteValue,
  selectInputText,
  validateChar,
  valueToArray,
} from './utils';

export function usePinInput(options: UsePinInputOptions): UsePinInputReturn {
  const {
    length,
    value: externalValue = '',
    onChange,
    onComplete,
    alphanumeric = false,
    validate,
    autoFocus = false,
  } = options;

  // Internal state for uncontrolled usage
  const [internalValue, setInternalValue] = useState(externalValue);
  
  // Use external value if provided (controlled), otherwise use internal
  const value = onChange ? externalValue : internalValue;
  
  // Refs for input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Track if auto-focus has been applied
  const autoFocusApplied = useRef(false);

  // Convert value to array of characters
  const values = useMemo(() => {
    return valueToArray(value, length);
  }, [value, length]);

  // Check if all inputs are complete
  const isComplete = useMemo(() => {
    return isCompleteValue(values);
  }, [values]);

  // Call onComplete when all inputs are filled
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete(value);
    }
  }, [isComplete, value, onComplete]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && !autoFocusApplied.current) {
      autoFocusApplied.current = true;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  // Update internal value when external value changes
  useEffect(() => {
    if (onChange) {
      setInternalValue(externalValue);
    }
  }, [externalValue, onChange]);

  // Focus a specific input
  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  }, [length]);

  // Set the entire value
  const setValues = useCallback((newValue: string) => {
    const filtered = filterValue(newValue, length, { alphanumeric, validate });
    if (onChange) {
      onChange(filtered);
    } else {
      setInternalValue(filtered);
    }
  }, [length, alphanumeric, validate, onChange]);

  // Set a specific value at an index
  const setValue = useCallback((index: number, char: string) => {
    if (index < 0 || index >= length) return;
    
    const newValues = [...values];
    
    if (char === '') {
      newValues[index] = '';
    } else if (validateChar(char, { alphanumeric, validate })) {
      newValues[index] = char;
    } else {
      return;
    }
    
    const newValue = newValues.join('');
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  }, [values, length, alphanumeric, validate, onChange]);

  // Clear all inputs
  const clear = useCallback(() => {
    if (onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }
    focusInput(0);
  }, [onChange, focusInput]);

  // Handle input change
  const handleChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Handle case where user types into a filled input
    if (inputValue.length > 1) {
      // If the last character is valid, use it
      const lastChar = inputValue.slice(-1);
      if (validateChar(lastChar, { alphanumeric, validate })) {
        setValue(index, lastChar);
        // Move to next input
        if (index < length - 1) {
          focusInput(index + 1);
        }
      }
      return;
    }
    
    // Handle single character input
    if (inputValue === '') {
      setValue(index, '');
    } else if (validateChar(inputValue, { alphanumeric, validate })) {
      setValue(index, inputValue);
      // Auto-focus next input
      if (index < length - 1) {
        focusInput(index + 1);
      }
    }
  }, [length, alphanumeric, validate, setValue, focusInput]);

  // Handle key down
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        if (values[index]) {
          // If current input has value, clear it
          setValue(index, '');
        } else if (index > 0) {
          // If current input is empty, move to previous and clear it
          setValue(index - 1, '');
          focusInput(index - 1);
        }
        break;
      
      case 'Delete':
        e.preventDefault();
        setValue(index, '');
        break;
      
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          focusInput(index - 1);
          selectInputText(inputRefs.current[index - 1]);
        }
        break;
      
      case 'ArrowRight':
        e.preventDefault();
        if (index < length - 1) {
          focusInput(index + 1);
          selectInputText(inputRefs.current[index + 1]);
        }
        break;
      
      case 'Home':
        e.preventDefault();
        focusInput(0);
        selectInputText(inputRefs.current[0]);
        break;
      
      case 'End':
        e.preventDefault();
        focusInput(length - 1);
        selectInputText(inputRefs.current[length - 1]);
        break;
      
      default:
        // Handle alphanumeric input directly
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (validateChar(e.key, { alphanumeric, validate })) {
            setValue(index, e.key);
            if (index < length - 1) {
              focusInput(index + 1);
            }
          }
        }
        break;
    }
  }, [values, length, alphanumeric, validate, setValue, focusInput]);

  // Handle paste
  const handlePaste = useCallback((index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedData = e.clipboardData.getData('text');
    if (!pastedData) return;
    
    // Filter the pasted value
    const filtered = filterValue(pastedData, length, { alphanumeric, validate });
    
    if (filtered.length === 0) return;
    
    // Create new values array
    const newValues = [...values];
    
    // Fill from the current index
    let fillIndex = index;
    for (const char of filtered) {
      if (fillIndex < length) {
        newValues[fillIndex] = char;
        fillIndex++;
      }
    }
    
    const newValue = newValues.join('');
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newValues.findIndex((v, i) => v === '' && i >= index);
    if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    } else {
      focusInput(Math.min(fillIndex, length - 1));
    }
  }, [values, length, alphanumeric, validate, onChange, focusInput]);

  // Handle focus - select all text
  const handleFocus = useCallback((_index: number, e: React.FocusEvent<HTMLInputElement>) => {
    selectInputText(e.target);
  }, []);

  return {
    values,
    setValue,
    setValues,
    clear,
    isComplete,
    handlers: {
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onFocus: handleFocus,
    },
    inputRefs,
    focusInput,
  };
}

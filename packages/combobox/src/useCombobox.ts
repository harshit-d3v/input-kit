import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { 
  ComboboxOption, 
  UseComboboxProps, 
  UseComboboxReturn 
} from './types.js';
import {
  defaultFilterFn,
  debounce,
  getOptionValue,
  isOptionSelected,
  removeValueFromArray,
  generateId,
  createCreatableOption,
} from './utils.js';

export function useCombobox<T>(props: UseComboboxProps<T>): UseComboboxReturn<T> {
  const {
    options: staticOptions = [],
    loadOptions,
    value,
    onChange,
    multi = false,
    creatable = false,
    createLabel,
    clearInputOnSelect = !multi,
    filterFn = defaultFilterFn,
    debounceMs = 300,
    loading: externalLoading = false,
    onInputChange,
    id: idProp,
  } = props;

  // Generate unique ID for accessibility
  const id = useMemo(() => idProp || generateId('combobox'), [idProp]);
  const listboxId = `${id}-listbox`;

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState<ComboboxOption<T>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAsync = loadOptions !== undefined;

  // Determine which options to use
  const baseOptions = isAsync ? asyncOptions : staticOptions;

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    let opts = baseOptions;
    
    // For static options, filter locally
    if (!isAsync && inputValue) {
      opts = opts.filter(option => filterFn(option, inputValue));
    }
    
    // Add creatable option if applicable
    if (creatable && inputValue) {
      const exists = opts.some(opt => 
        opt.label.toLowerCase() === inputValue.toLowerCase()
      );
      if (!exists) {
        opts = [...opts, createCreatableOption<T>(inputValue, createLabel)];
      }
    }
    
    return opts;
  }, [baseOptions, inputValue, isAsync, creatable, createLabel, filterFn]);

  // Debounced async load
  const debouncedLoadOptions = useMemo(
    () => debounce(async (query: string) => {
      if (!loadOptions) return;
      
      setIsLoading(true);
      try {
        const result = await loadOptions(query);
        setAsyncOptions(result);
        setHasLoaded(true);
      } catch {
        // Silently reset options on load failure; the caller's loadOptions
        // implementation should handle user-facing error reporting.
        setAsyncOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [loadOptions, debounceMs]
  );

  // Cancel pending debounce when debouncedLoadOptions is recreated or component unmounts
  useEffect(() => {
    return () => {
      debouncedLoadOptions.cancel();
    };
  }, [debouncedLoadOptions]);

  // Load options when input changes (async mode)
  useEffect(() => {
    if (isAsync && isOpen) {
      debouncedLoadOptions(inputValue);
    }
  }, [inputValue, isOpen, isAsync, debouncedLoadOptions]);

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  // Cleanup blur timeout
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Handlers
  const open = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      // Trigger load for async mode
      if (isAsync && !hasLoaded) {
        debouncedLoadOptions(inputValue);
      }
    }
  }, [isOpen, isAsync, hasLoaded, inputValue, debouncedLoadOptions]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(0);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const selectOption = useCallback((index: number) => {
    const option = filteredOptions[index];
    if (!option || option.disabled) return;

    const optionValue = getOptionValue(option);

    if (multi) {
      // Multi-select mode
      const currentValue = (value as T[]) || [];
      const isSelected = isOptionSelected(option, value);
      
      if (isSelected) {
        onChange(removeValueFromArray(currentValue, optionValue));
      } else {
        onChange([...currentValue, optionValue]);
      }
      
      // Keep input focused and dropdown open for multi-select
      inputRef.current?.focus();
    } else {
      // Single-select mode
      onChange(optionValue);
      
      if (clearInputOnSelect) {
        setInputValue('');
      } else {
        setInputValue(option.label);
      }
      
      close();
    }
  }, [filteredOptions, value, multi, onChange, clearInputOnSelect, close]);

  const highlightOption = useCallback((index: number) => {
    if (index >= 0 && index < filteredOptions.length) {
      setHighlightedIndex(index);
    }
  }, [filteredOptions.length]);

  const clearSelection = useCallback(() => {
    onChange(multi ? [] : null);
    setInputValue('');
    inputRef.current?.focus();
  }, [onChange, multi]);

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    onInputChange?.(newValue);
    
    if (!isOpen && newValue) {
      open();
    }
  }, [isOpen, onInputChange, open]);

  const isSelected = useCallback((option: ComboboxOption<T>) => {
    return isOptionSelected(option, value);
  }, [value]);

  const getOptionId = useCallback((index: number) => {
    return `${id}-option-${index}`;
  }, [id]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (isOpen && filteredOptions.length > 0) {
          selectOption(highlightedIndex);
        } else if (!isOpen) {
          open();
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        if (isOpen) {
          close();
        } else {
          setInputValue('');
        }
        break;
        
      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setHighlightedIndex(0);
        }
        break;
        
      case 'End':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;
        
      case 'Tab':
        if (isOpen && !multi) {
          // Select highlighted option on tab (single select only)
          if (filteredOptions.length > 0 && highlightedIndex >= 0) {
            selectOption(highlightedIndex);
          }
        }
        break;
        
      case 'Backspace':
        if (multi && !inputValue && Array.isArray(value) && value.length > 0) {
          // Remove last selected item when input is empty
          const newValue = value.slice(0, -1);
          onChange(newValue);
        }
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, selectOption, open, close, multi, value, inputValue, onChange]);

  // Handle focus/blur
  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    open();
  }, [open]);

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      close();
    }, 150);
  }, [close]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedElement = document.getElementById(getOptionId(highlightedIndex));
      if (highlightedElement && typeof highlightedElement.scrollIntoView === 'function') {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen, getOptionId]);

  const loading = externalLoading || isLoading;

  return {
    inputProps: {
      value: inputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value),
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? listboxId : undefined,
      'aria-activedescendant': isOpen ? getOptionId(highlightedIndex) : undefined,
      'aria-autocomplete': 'list',
      autoComplete: 'off',
    },
    inputRef,
    listboxProps: {
      role: 'listbox',
      id: listboxId,
      'aria-multiselectable': multi,
    },
    listboxRef,
    isOpen,
    highlightedIndex,
    filteredOptions,
    selectOption,
    highlightOption,
    clearSelection,
    open,
    close,
    toggle,
    inputValue,
    setInputValue: handleInputChange,
    isLoading: loading,
    isSelected,
    getOptionId,
  };
}

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  placeholder?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
}

export function useSearch(options: {
  debounceMs?: number;
  onSearch?: (value: string) => void;
  initialValue?: string;
} = {}) {
  const { debounceMs = 300, onSearch, initialValue = '' } = options;
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  // Stable ref for callback to avoid stale closures and infinite re-effects
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      onSearchRef.current?.(value);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debounceMs]);

  const clear = useCallback(() => {
    setValue('');
    setDebouncedValue('');
  }, []);

  return {
    value,
    debouncedValue,
    setValue,
    clear,
  };
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    const {
      placeholder = 'Search...',
      debounceMs = 300,
      onSearch,
      onChange,
      value: controlledValue,
      defaultValue = '',
      autoFocus,
      className,
      type,
      ...inputProps
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? controlledValue ?? '' : internalValue;
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const onSearchRef = useRef(onSearch);

    onSearchRef.current = onSearch;

    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSearchRef.current?.(currentValue);
      }, debounceMs);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [currentValue, debounceMs]);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
    }, [isControlled, onChange]);

    return (
      <input
        {...inputProps}
        ref={ref}
        type={type ?? 'search'}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
      />
    );
  }
);
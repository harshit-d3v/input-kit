import { useState, useEffect } from 'react';

/**
 * Debounce a value, delaying updates until it stops changing.
 *
 * @param value the value to debounce
 * @param delay quiet period in ms before the value is adopted. Defaults to 500.
 * @returns the value as of `delay` ms after the last change
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // debouncedSearch updates 300ms after searchTerm stops changing
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

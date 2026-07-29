import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Persist state to sessionStorage
 * @param key The sessionStorage key
 * @param initialValue The initial value
 * @returns A stateful value and a function to update it
 * 
 * @example
 * const [session, setSession] = useSessionStorage('session', { user: null });
 * 
 * // Updates sessionStorage automatically
 * setSession({ user: { id: 1 } });
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);
  const valueRef = useRef(storedValue);

  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(valueRef.current) : value;
        valueRef.current = valueToStore;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

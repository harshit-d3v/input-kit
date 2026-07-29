import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Persist state to localStorage
 * @param key The localStorage key
 * @param initialValue The initial value
 * @returns A stateful value and a function to update it
 * 
 * @example
 * const [name, setName] = useLocalStorage('name', 'John');
 * 
 * // Updates localStorage automatically
 * setName('Jane');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);
  const valueRef = useRef(storedValue);

  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(valueRef.current) : value;
        valueRef.current = valueToStore;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          const newValue = JSON.stringify(valueToStore);
          window.localStorage.setItem(key, newValue);
          // Dispatch custom event for cross-tab sync
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue,
            storageArea: window.localStorage,
          }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, readValue]);

  return [storedValue, setValue];
}

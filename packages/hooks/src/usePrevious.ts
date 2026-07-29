import { useRef, useEffect } from 'react';

/**
 * Get the previous value of a state or prop
 * @param value The current value
 * @returns The previous value
 * 
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * 
 * // prevCount is the value from the previous render
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const prevRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    prevRef.current = ref.current;
    ref.current = value;
  }, [value]);

  return prevRef.current;
}

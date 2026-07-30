import { useRef } from 'react';

/**
 * The previous distinct value of something.
 *
 * @param value the current value
 * @returns the value from before it last changed, or undefined until it changes once
 *
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * // count 0 -> 1 -> 1 -> 2  gives  undefined -> 0 -> 0 -> 1
 *
 * @remarks
 * Two deliberate choices worth knowing about.
 *
 * It tracks the previous *distinct* value, not the value from the previous render.
 * Re-rendering without changing the value leaves the result alone, which is almost
 * always what callers comparing against it want.
 *
 * The comparison happens during render rather than in an effect. A ref written by
 * an effect cannot be reflected in what render already returned, so an effect-based
 * version reports a value that is one render behind. Because the write is guarded by
 * a change check it is idempotent, and so stays correct under StrictMode's
 * double-invoked render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const currentRef = useRef<T | undefined>(undefined);
  const previousRef = useRef<T | undefined>(undefined);
  const initialised = useRef(false);

  if (!initialised.current) {
    initialised.current = true;
    currentRef.current = value;
  } else if (!Object.is(value, currentRef.current)) {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }

  return previousRef.current;
}

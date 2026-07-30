import { useCallback, useEffect, useRef } from 'react';

/**
 * Throttle a function: run it at most once per window, and once more at the end of
 * the window with whatever the most recent arguments were.
 *
 * @param fn the function to throttle
 * @param limit minimum gap between invocations, in ms. Defaults to 500.
 * @returns a throttled function with a stable identity
 *
 * @example
 * const onScroll = useThrottle((y: number) => setOffset(y), 200);
 * useEffect(() => {
 *   const handler = () => onScroll(window.scrollY);
 *   window.addEventListener('scroll', handler);
 *   return () => window.removeEventListener('scroll', handler);
 * }, [onScroll]);
 *
 * @remarks
 * The trailing call delivers the *latest* arguments, not the ones from when it was
 * scheduled — throttling a search box should search for what the user last typed,
 * not for what they had typed when the window opened.
 *
 * The returned function keeps the same identity for the life of the component, so
 * it is safe to use as an effect dependency or attach as an event listener.
 */
export function useThrottle<T extends (...args: any[]) => void>(fn: T, limit = 500): T {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);

  // Read through refs so the throttled function's identity never changes, even when
  // the caller passes an inline function or changes the limit.
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const limitRef = useRef(limit);
  limitRef.current = limit;

  // A queued trailing call must not fire after the component is gone.
  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      pendingArgsRef.current = null;
    },
    [],
  );

  const throttled = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const elapsed = now - lastCallRef.current;
    const wait = limitRef.current;

    if (elapsed >= wait) {
      lastCallRef.current = now;
      fnRef.current(...args);
      return;
    }

    // Inside the window: keep only the newest arguments, and let the already
    // scheduled trailing call deliver them.
    pendingArgsRef.current = args;

    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        lastCallRef.current = Date.now();

        const queued = pendingArgsRef.current;
        pendingArgsRef.current = null;
        if (queued) fnRef.current(...queued);
      }, wait - elapsed);
    }
  }, []);

  return throttled as T;
}

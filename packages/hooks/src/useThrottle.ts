import { useRef, useCallback } from 'react';

/**
 * Throttle a function to limit how often it can be called
 * @param fn The function to throttle
 * @param limit The time limit in milliseconds
 * @returns The throttled function
 * 
 * @example
 * const throttledScroll = useThrottle((pos) => {
 *   console.log('Scroll position:', pos);
 * }, 200);
 * 
 * window.addEventListener('scroll', () => throttledScroll(window.scrollY));
 */
export function useThrottle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= limit) {
        lastCallRef.current = now;
        fn(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
          fn(...args);
        }, limit - timeSinceLastCall);
      }
    },
    [fn, limit]
  );

  return throttledFn as T;
}

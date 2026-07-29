import { useEffect, RefObject } from 'react';

/**
 * Detect clicks outside a referenced element
 * @param ref Ref to the element to monitor
 * @param handler Callback when click occurs outside
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 * 
 * <div ref={ref}>Click outside to close</div>
 */
export function useClickOutside(
  ref: RefObject<Element | null>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

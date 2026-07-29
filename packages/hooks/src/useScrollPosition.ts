import { useState, useEffect, RefObject } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Track scroll position of window or an element
 * @param ref Optional ref to track element scroll (defaults to window)
 * @returns Current scroll position { x, y }
 * 
 * @example
 * // Track window scroll
 * const { y } = useScrollPosition();
 * 
 * // Track element scroll
 * const ref = useRef<HTMLDivElement>(null);
 * const { x, y } = useScrollPosition(ref);
 * 
 * <div ref={ref}>Scroll: {x}, {y}</div>
 */
export function useScrollPosition(
  ref?: RefObject<HTMLElement | null>
): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref?.current;

    const handleScroll = () => {
      if (element) {
        setPosition({ x: element.scrollLeft, y: element.scrollTop });
      } else {
        setPosition({ x: window.scrollX, y: window.scrollY });
      }
    };

    // Initial position
    handleScroll();

    const target = element || window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [ref]);

  return position;
}

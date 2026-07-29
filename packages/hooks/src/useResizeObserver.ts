import { useState, useEffect, RefObject } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * Observe element size changes
 * @param ref Ref to the element to observe
 * @returns Current size of the element
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { width, height } = useResizeObserver(ref);
 * 
 * <div ref={ref}>Size: {width} x {height}</div>
 */
export function useResizeObserver(
  ref: RefObject<Element | null>
): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
}

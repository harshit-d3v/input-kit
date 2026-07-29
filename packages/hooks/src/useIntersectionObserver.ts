import { useState, useEffect, useRef } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Track when an element enters/exits the viewport
 * @param options IntersectionObserver options
 * @returns [ref, isIntersecting, entry]
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 * 
 * return <div ref={ref}>{isVisible ? 'Visible!' : 'Not visible'}</div>;
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean, IntersectionObserverEntry | null] {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, triggerOnce]);

  return [ref, isIntersecting, entry];
}

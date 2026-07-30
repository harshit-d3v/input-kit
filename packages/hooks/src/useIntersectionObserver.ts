import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { createReactiveRef } from './internal/reactiveRef.js';

export interface UseIntersectionObserverOptions {
  /** Viewport used for intersection. Defaults to the browser viewport. */
  root?: Element | null;
  /** Margin grown around the root before intersection is computed. Defaults to `'0px'`. */
  rootMargin?: string;
  /** Ratio, or ratios, at which the callback fires. Defaults to 0. */
  threshold?: number | number[];
  /** Stop observing once the element has intersected once. Defaults to false. */
  triggerOnce?: boolean;
}

export interface UseIntersectionObserverReturn<T extends Element> {
  /** Attach to the element you want tracked: `<div ref={ref} />`. */
  ref: MutableRefObject<T | null>;
  /** Whether the element currently intersects the root. */
  isIntersecting: boolean;
  /** How much of the element is visible, 0 to 1. */
  intersectionRatio: number;
  /** The raw entry behind the current state, or null before the first callback. */
  entry: IntersectionObserverEntry | null;
}

/**
 * Track whether an element is in view.
 *
 * @param options `root`, `rootMargin` and `threshold` are passed to
 *   IntersectionObserver; `triggerOnce` disconnects after the first intersection
 * @returns `{ ref, isIntersecting, intersectionRatio, entry }`
 *
 * @example Reveal something once it scrolls into view, then stop watching
 * const { ref, isIntersecting } = useIntersectionObserver({ triggerOnce: true });
 * return <div ref={ref}>{isIntersecting ? <Chart /> : null}</div>;
 *
 * @remarks
 * Where `IntersectionObserver` is unavailable this reports the element as fully
 * visible (`isIntersecting: true`, `intersectionRatio: 1`) rather than as hidden.
 * Content gated on visibility should degrade to shown, not to missing.
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn<T> {
  const { root = null, rootMargin = '0px', threshold = 0, triggerOnce = false } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedRef = useRef<Element | null>(null);
  const triggerOnceRef = useRef(triggerOnce);
  triggerOnceRef.current = triggerOnce;

  const attach = useCallback((element: Element | null) => {
    const observer = observerRef.current;
    if (!observer) return;

    if (observedRef.current) {
      observer.unobserve(observedRef.current);
      observedRef.current = null;
    }
    if (element) {
      observer.observe(element);
      observedRef.current = element;
    }
  }, []);

  const notifyRef = useRef<(element: T | null) => void>(() => {});
  notifyRef.current = attach;

  const refHolder = useRef<MutableRefObject<T | null> | null>(null);
  if (refHolder.current === null) {
    refHolder.current = createReactiveRef<T>((element) => notifyRef.current(element));
  }
  const ref = refHolder.current;

  // Callers routinely pass an inline array, so the effect keys on contents rather
  // than identity.
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold);
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      setIsIntersecting(true);
      setIntersectionRatio(1);
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        if (!last) return;

        setEntry(last);
        setIsIntersecting(last.isIntersecting);
        setIntersectionRatio(last.intersectionRatio);

        if (last.isIntersecting && triggerOnceRef.current) {
          observer.disconnect();
          observedRef.current = null;
        }
      },
      { root, rootMargin, threshold: thresholdRef.current },
    );

    observerRef.current = observer;

    // React assigns refs before effects run, so the element may already be here.
    attach(ref.current);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      observedRef.current = null;
    };
  }, [attach, ref, root, rootMargin, thresholdKey]);

  return { ref, isIntersecting, intersectionRatio, entry };
}

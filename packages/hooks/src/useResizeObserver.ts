import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { createReactiveRef } from './internal/reactiveRef.js';

export interface Size {
  width: number;
  height: number;
}

export interface UseResizeObserverOptions {
  /** Which box to measure. Defaults to `'content-box'`. */
  box?: ResizeObserverBoxOptions;
}

export interface UseResizeObserverReturn<T extends Element> {
  /** Attach to the element you want measured: `<div ref={ref} />`. */
  ref: MutableRefObject<T | null>;
  /** Latest measured size. `{ width: 0, height: 0 }` until the first observation. */
  size: Size;
  /** The raw entry behind `size`, or null before the first observation. */
  entry: ResizeObserverEntry | null;
}

function measure(entry: ResizeObserverEntry): Size {
  // contentBoxSize is the spec-preferred reading, but it is an empty array in
  // some browsers and in most test doubles, so fall back to contentRect.
  const boxSize = entry.contentBoxSize?.[0];
  if (boxSize) {
    return { width: boxSize.inlineSize, height: boxSize.blockSize };
  }
  return { width: entry.contentRect.width, height: entry.contentRect.height };
}

/**
 * Observe an element's size.
 *
 * @param callback optional passthrough of the raw ResizeObserver callback
 * @param options `box` selects which box is measured
 * @returns `{ ref, size, entry }` — attach `ref` to the element to measure
 *
 * @example
 * const { ref, size } = useResizeObserver<HTMLDivElement>();
 * return <div ref={ref}>{size.width} x {size.height}</div>;
 *
 * @example Reacting to every observation
 * const { ref } = useResizeObserver((entries) => {
 *   console.log(entries[0].contentRect);
 * }, { box: 'border-box' });
 *
 * @remarks
 * Does nothing where `ResizeObserver` is unavailable — `size` simply stays at
 * `{ width: 0, height: 0 }` rather than throwing, so this is safe to call during
 * SSR and in older browsers.
 */
export function useResizeObserver<T extends Element = HTMLDivElement>(
  callback?: ResizeObserverCallback,
  options: UseResizeObserverOptions = {},
): UseResizeObserverReturn<T> {
  const { box = 'content-box' } = options;

  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);

  const observerRef = useRef<ResizeObserver | null>(null);
  const observedRef = useRef<Element | null>(null);
  const boxRef = useRef(box);
  boxRef.current = box;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const attach = useCallback((element: Element | null) => {
    const observer = observerRef.current;
    if (!observer) return;

    if (observedRef.current) {
      observer.unobserve(observedRef.current);
      observedRef.current = null;
    }
    if (element) {
      observer.observe(element, { box: boxRef.current });
      observedRef.current = element;
    }
  }, []);

  // Notification is routed through a ref so the reactive ref below can be created
  // once and still reach the current attach closure.
  const notifyRef = useRef<(element: T | null) => void>(() => {});
  notifyRef.current = attach;

  const refHolder = useRef<MutableRefObject<T | null> | null>(null);
  if (refHolder.current === null) {
    refHolder.current = createReactiveRef<T>((element) => notifyRef.current(element));
  }
  const ref = refHolder.current;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.ResizeObserver !== 'function') {
      return;
    }

    const observer = new window.ResizeObserver((entries, self) => {
      const last = entries[entries.length - 1];
      if (last) {
        setEntry(last);
        setSize(measure(last));
      }
      callbackRef.current?.(entries, self);
    });

    observerRef.current = observer;

    // The element may already be attached — React assigns refs before effects run.
    attach(ref.current);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      observedRef.current = null;
    };
  }, [attach, ref, box]);

  return { ref, size, entry };
}

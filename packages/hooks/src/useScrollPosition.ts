import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type ScrollDirectionX = 'left' | 'right' | 'none';
export type ScrollDirectionY = 'up' | 'down' | 'none';

export interface ScrollPosition {
  /** Horizontal offset. */
  x: number;
  /** Vertical offset. */
  y: number;
  /** Which way the last horizontal movement went. */
  directionX: ScrollDirectionX;
  /** Which way the last vertical movement went. */
  directionY: ScrollDirectionY;
  /** Largest reachable `x`. */
  maxX: number;
  /** Largest reachable `y`. */
  maxY: number;
}

export interface UseScrollPositionOptions {
  /** Minimum ms between updates. 0 updates on every event. Defaults to 0. */
  throttleDelay?: number;
  /** Compute `directionX` / `directionY`. Defaults to true. */
  trackDirection?: boolean;
}

const INITIAL: ScrollPosition = {
  x: 0,
  y: 0,
  directionX: 'none',
  directionY: 'none',
  maxX: 0,
  maxY: 0,
};

function samePosition(a: ScrollPosition, b: ScrollPosition): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.directionX === b.directionX &&
    a.directionY === b.directionY &&
    a.maxX === b.maxX &&
    a.maxY === b.maxY
  );
}

/**
 * Track scroll position, direction and extent, for the window or one element.
 *
 * @param ref element to track. Omit to track the window.
 * @param options `throttleDelay` and `trackDirection`
 * @returns `{ x, y, directionX, directionY, maxX, maxY }`
 *
 * @example Hide a header while scrolling down
 * const { directionY } = useScrollPosition();
 * return <header hidden={directionY === 'down'} />;
 *
 * @example A scroll container, updating at most every 100ms
 * const ref = useRef<HTMLDivElement>(null);
 * const { y, maxY } = useScrollPosition(ref, { throttleDelay: 100 });
 * const progress = maxY === 0 ? 0 : y / maxY;
 *
 * @remarks
 * `ref` is read at event time and is deliberately not an effect dependency. Callers
 * reasonably write `useScrollPosition({ current: el })` inline, which is a new
 * object every render; keying the listener on that identity would reattach it, read
 * the position, set state, and re-render — forever. State is also left untouched
 * when nothing measurable changed, so a scroll event that moves nothing does not
 * cause a render.
 */
export function useScrollPosition(
  ref?: RefObject<HTMLElement | null>,
  options: UseScrollPositionOptions = {},
): ScrollPosition {
  const { throttleDelay = 0, trackDirection = true } = options;

  const [position, setPosition] = useState<ScrollPosition>(INITIAL);

  const refHolder = useRef(ref);
  refHolder.current = ref;

  const trackDirectionRef = useRef(trackDirection);
  trackDirectionRef.current = trackDirection;

  const throttleRef = useRef(throttleDelay);
  throttleRef.current = throttleDelay;

  const lastRunRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback(() => {
    const element = refHolder.current?.current ?? null;

    setPosition((prev) => {
      let next: ScrollPosition;

      if (element) {
        next = {
          x: element.scrollLeft,
          y: element.scrollTop,
          directionX: 'none',
          directionY: 'none',
          maxX: Math.max(0, element.scrollWidth - element.clientWidth),
          maxY: Math.max(0, element.scrollHeight - element.clientHeight),
        };
      } else if (typeof window === 'undefined') {
        return prev;
      } else {
        const doc = document.documentElement;
        next = {
          x: window.scrollX,
          y: window.scrollY,
          directionX: 'none',
          directionY: 'none',
          maxX: Math.max(0, doc.scrollWidth - window.innerWidth),
          maxY: Math.max(0, doc.scrollHeight - window.innerHeight),
        };
      }

      if (trackDirectionRef.current) {
        if (next.x !== prev.x) next.directionX = next.x > prev.x ? 'right' : 'left';
        if (next.y !== prev.y) next.directionY = next.y > prev.y ? 'down' : 'up';
      }

      // Bail out rather than allocating a new state object for an identical value.
      return samePosition(prev, next) ? prev : next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onScroll = () => {
      const delay = throttleRef.current;
      if (delay <= 0) {
        commit();
        return;
      }

      const now = Date.now();
      const elapsed = now - lastRunRef.current;

      if (elapsed >= delay) {
        lastRunRef.current = now;
        commit();
        return;
      }

      // Inside the throttle window: schedule one trailing read. It re-measures at
      // the time it runs, so it always reflects the latest position.
      if (timerRef.current === null) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          lastRunRef.current = Date.now();
          commit();
        }, delay - elapsed);
      }
    };

    const target: HTMLElement | Window = refHolder.current?.current ?? window;
    target.addEventListener('scroll', onScroll, { passive: true });

    // Establish maxX / maxY without reporting a direction.
    commit();

    return () => {
      target.removeEventListener('scroll', onScroll);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [commit]);

  return position;
}

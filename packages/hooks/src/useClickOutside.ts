import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

/** Events that can dismiss. Defaults cover both pointer and touch. */
export type ClickOutsideEvent = 'mousedown' | 'mouseup' | 'click' | 'touchstart' | 'touchend';

export interface UseClickOutsideOptions {
  /** Which events count as a click. Defaults to `['mousedown', 'touchstart']`. */
  events?: ClickOutsideEvent[];
  /** Set false to detach the listeners entirely. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_EVENTS: ClickOutsideEvent[] = ['mousedown', 'touchstart'];

/**
 * Detect clicks outside an element — the dismiss behaviour behind dropdowns,
 * popovers and modals.
 *
 * @param callback invoked with the event when a click lands outside
 * @param options which events to listen for, and whether listening is active
 * @returns a ref to attach to the element that should be treated as "inside"
 *
 * @example
 * const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
 * return <div ref={ref}>{open ? <Menu /> : null}</div>;
 *
 * @example Touch only, and only while the menu is open
 * const ref = useClickOutside<HTMLDivElement>(close, {
 *   events: ['touchstart'],
 *   enabled: open,
 * });
 *
 * @remarks
 * Listens on `document` during the *down* phase by default, so a dropdown closes
 * before a click elsewhere can activate something. Clicks on the element or any
 * descendant are inside and do not fire.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: (event: Event) => void,
  options: UseClickOutsideOptions = {},
): MutableRefObject<T | null> {
  const { events = DEFAULT_EVENTS, enabled = true } = options;

  const ref = useRef<T | null>(null);

  // Read through a ref so an inline callback does not detach and reattach the
  // listeners on every render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Callers pass an inline array, so key the effect on contents, not identity.
  const eventsKey = events.join(' ');
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const listener = (event: Event) => {
      const element = ref.current;
      // No element yet means there is no "inside" to be outside of.
      if (!element) return;

      const target = event.target as Node | null;
      if (target && element.contains(target)) return;

      callbackRef.current(event);
    };

    const attached = eventsRef.current;
    attached.forEach((name) => document.addEventListener(name, listener));

    return () => {
      attached.forEach((name) => document.removeEventListener(name, listener));
    };
  }, [enabled, eventsKey]);

  return ref;
}

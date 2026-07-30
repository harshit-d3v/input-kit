import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

export interface UseFullscreenReturn {
  /** Whether anything is currently fullscreen. */
  isFullscreen: boolean;
  /** Why the last request failed, or null. */
  error: Error | null;
  /** Request fullscreen for the target element. Never rejects. */
  enter: () => Promise<boolean>;
  /** Leave fullscreen, if in it. Never rejects. */
  exit: () => Promise<boolean>;
  /** Enter if not fullscreen, otherwise exit. */
  toggle: () => Promise<boolean>;
}

function currentFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null;
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement ?? null;
}

function requestOn(element: Element): (() => Promise<void> | void) | undefined {
  const el = element as FullscreenElement;
  const fn = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.msRequestFullscreen;
  return typeof fn === 'function' ? fn.bind(el) : undefined;
}

function exitOnDocument(): (() => Promise<void> | void) | undefined {
  if (typeof document === 'undefined') return undefined;
  const doc = document as FullscreenDocument;
  const fn = doc.exitFullscreen ?? doc.webkitExitFullscreen ?? doc.msExitFullscreen;
  return typeof fn === 'function' ? fn.bind(doc) : undefined;
}

/** Vendor-prefixed variants are still the only way in on some Safari versions. */
const CHANGE_EVENTS = ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'];

/**
 * Drive the Fullscreen API for an element, or for the whole page.
 *
 * @param ref element to make fullscreen. Defaults to `document.documentElement`.
 * @returns `{ isFullscreen, error, enter, exit, toggle }`
 *
 * @example Whole page
 * const { isFullscreen, toggle } = useFullscreen();
 * return <button onClick={toggle}>{isFullscreen ? 'Exit' : 'Go'} fullscreen</button>;
 *
 * @example A specific element
 * const ref = useRef<HTMLVideoElement>(null);
 * const { toggle } = useFullscreen(ref);
 *
 * @remarks
 * `enter`, `exit` and `toggle` resolve to a boolean instead of rejecting. Browsers
 * refuse fullscreen outside a user gesture, which is expected rather than
 * exceptional, so the reason lands in `error` and the caller needs no try/catch.
 */
export function useFullscreen<T extends Element = Element>(
  ref?: RefObject<T | null>,
): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refHolder = useRef(ref);
  refHolder.current = ref;

  const target = useCallback((): Element | null => {
    const fromRef = refHolder.current?.current;
    if (fromRef) return fromRef;
    return typeof document === 'undefined' ? null : document.documentElement;
  }, []);

  const enter = useCallback(async (): Promise<boolean> => {
    setError(null);

    const element = target();
    const request = element ? requestOn(element) : undefined;
    if (!request) {
      setError(new Error('Fullscreen API not supported'));
      return false;
    }

    try {
      await request();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
      return false;
    }
  }, [target]);

  const exit = useCallback(async (): Promise<boolean> => {
    setError(null);

    // Calling exitFullscreen when nothing is fullscreen rejects in some browsers.
    if (!currentFullscreenElement()) return false;

    const request = exitOnDocument();
    if (!request) {
      setError(new Error('Fullscreen API not supported'));
      return false;
    }

    try {
      await request();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
      return false;
    }
  }, []);

  const toggle = useCallback(
    (): Promise<boolean> => (currentFullscreenElement() ? exit() : enter()),
    [enter, exit],
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const onChange = () => setIsFullscreen(currentFullscreenElement() !== null);

    CHANGE_EVENTS.forEach((name) => document.addEventListener(name, onChange));
    // The document may already be fullscreen when this mounts.
    onChange();

    return () => {
      CHANGE_EVENTS.forEach((name) => document.removeEventListener(name, onChange));
    };
  }, []);

  return { isFullscreen, error, enter, exit, toggle };
}

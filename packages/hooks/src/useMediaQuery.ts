import { useEffect, useState } from 'react';

export interface UseMediaQueryOptions {
  /** Value reported before a real match is available. Defaults to false. */
  defaultValue?: boolean;
  /**
   * Read `matchMedia` during the first render. Defaults to true.
   *
   * Set false when server-rendering: the server has no viewport, so a first render
   * that guesses will not match the client and React will report a hydration
   * mismatch. With this off the first render uses `defaultValue` on both sides and
   * the real value arrives in an effect.
   */
  initializeWithValue?: boolean;
}

function getMediaQueryList(query: string): MediaQueryList | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined;
  }
  return window.matchMedia(query);
}

/**
 * Track a CSS media query.
 *
 * @param query the media query to evaluate
 * @param options `defaultValue` and `initializeWithValue`
 * @returns whether the query currently matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 * @example Server-rendered, avoiding a hydration mismatch
 * const isWide = useMediaQuery(breakpoints.lg, {
 *   defaultValue: false,
 *   initializeWithValue: false,
 * });
 *
 * @remarks
 * Returns `defaultValue` where `matchMedia` is unavailable rather than throwing, so
 * this is safe to call during SSR and in environments that do not implement it.
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultValue = false, initializeWithValue = true } = options;

  const [matches, setMatches] = useState<boolean>(() => {
    if (!initializeWithValue) return defaultValue;
    return getMediaQueryList(query)?.matches ?? defaultValue;
  });

  useEffect(() => {
    const media = getMediaQueryList(query);
    if (!media) return;

    // The viewport can change between render and this effect.
    setMatches(media.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // addEventListener on MediaQueryList is missing in Safari before 14.
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [query]);

  return matches;
}

/** Tailwind's default breakpoints, as min-width queries. */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

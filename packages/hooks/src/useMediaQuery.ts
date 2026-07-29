import { useState, useEffect } from 'react';

/**
 * Track a CSS media query
 * @param query The media query to track
 * @returns Whether the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    const updateMatch = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    } else {
      // Legacy browsers
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);

  return matches;
}

// Common breakpoints
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

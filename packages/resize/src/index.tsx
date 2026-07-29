// @input-kit/resize - Resize observer hook and utilities

import { useState, useRef, useEffect, RefObject } from 'react';

// Types
export interface Size {
  width: number;
  height: number;
}

export interface ContentRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BorderBoxSize {
  blockSize: number;
  inlineSize: number;
}

export interface ResizeEntry {
  target: Element;
  contentRect: ContentRect;
  borderBoxSize: BorderBoxSize[];
  contentBoxSize: BorderBoxSize[];
  devicePixelContentBoxSize?: BorderBoxSize[];
}

export interface UseResizeObserverOptions {
  onResize?: (entry: ResizeEntry) => void;
  box?: 'content-box' | 'border-box' | 'device-pixel-content-box';
  debounceMs?: number;
}

export interface UseResizeObserverReturn {
  ref: RefObject<HTMLElement>;
  size: Size;
  entry: ResizeEntry | null;
}

export interface UseElementSizeOptions {
  debounceMs?: number;
  defaultSize?: Size;
}

export interface UseWindowSizeOptions {
  debounceMs?: number;
  includeScrollbar?: boolean;
}

type DebouncedFunction<T extends (...args: any[]) => void> = ((...args: Parameters<T>) => void) & {
  cancel: () => void;
};

// Utility to debounce function calls
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): DebouncedFunction<(...args: Parameters<T>) => void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => fn(...args), ms);
  }) as DebouncedFunction<(...args: Parameters<T>) => void>;

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
}

// Main resize observer hook
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  options: UseResizeObserverOptions = {}
): UseResizeObserverReturn {
  const { onResize, box = 'content-box', debounceMs } = options;
  
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [entry, setEntry] = useState<ResizeEntry | null>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const resizeEntry = entries[0];
      if (!resizeEntry) return;
      
      const { contentRect, borderBoxSize, contentBoxSize, devicePixelContentBoxSize, target } = resizeEntry;
      
      const newEntry: ResizeEntry = {
        target,
        contentRect: {
          x: contentRect.x,
          y: contentRect.y,
          width: contentRect.width,
          height: contentRect.height,
          top: contentRect.top,
          right: contentRect.right,
          bottom: contentRect.bottom,
          left: contentRect.left,
        },
        borderBoxSize: borderBoxSize ? Array.from(borderBoxSize) : [],
        contentBoxSize: contentBoxSize ? Array.from(contentBoxSize) : [],
        devicePixelContentBoxSize: devicePixelContentBoxSize ? Array.from(devicePixelContentBoxSize) : undefined,
      };
      
      setEntry(newEntry);
      setSize({
        width: contentRect.width,
        height: contentRect.height,
      });
      
      onResize?.(newEntry);
    };
    
    const debouncedHandler = debounceMs 
      ? debounce(handleResize, debounceMs) 
      : handleResize;
    
    const observer = new ResizeObserver(debouncedHandler);
    observer.observe(element, { box });
    
    return () => {
      observer.disconnect();
      if (debounceMs) {
        (debouncedHandler as DebouncedFunction<typeof handleResize>).cancel();
      }
    };
  }, [box, debounceMs, onResize]);
  
  return { ref: ref as RefObject<HTMLElement>, size, entry };
}

// Simpler hook just for element size
export function useElementSize<T extends HTMLElement = HTMLElement>(
  options: UseElementSizeOptions = {}
): [RefObject<T>, Size] {
  const { debounceMs, defaultSize = { width: 0, height: 0 } } = options;
  
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>(defaultSize);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    
    // Set initial size
    const rect = element.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };
    
    const debouncedHandler = debounceMs 
      ? debounce(handleResize, debounceMs) 
      : handleResize;
    
    const observer = new ResizeObserver(debouncedHandler);
    observer.observe(element);
    
    return () => {
      observer.disconnect();
      if (debounceMs) {
        (debouncedHandler as DebouncedFunction<typeof handleResize>).cancel();
      }
    };
  }, [debounceMs]);
  
  return [ref, size];
}

// Hook for window size
export function useWindowSize(options: UseWindowSizeOptions = {}): Size {
  const { debounceMs, includeScrollbar = true } = options;
  
  const [size, setSize] = useState<Size>(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: includeScrollbar ? window.innerWidth : document.documentElement.clientWidth,
      height: includeScrollbar ? window.innerHeight : document.documentElement.clientHeight,
    };
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setSize({
        width: includeScrollbar ? window.innerWidth : document.documentElement.clientWidth,
        height: includeScrollbar ? window.innerHeight : document.documentElement.clientHeight,
      });
    };
    
    const debouncedHandler = debounceMs 
      ? debounce(handleResize, debounceMs) 
      : handleResize;
    
    window.addEventListener('resize', debouncedHandler);

    return () => {
      window.removeEventListener('resize', debouncedHandler);
      if (debounceMs) {
        (debouncedHandler as DebouncedFunction<typeof handleResize>).cancel();
      }
    };
  }, [debounceMs, includeScrollbar]);
  
  return size;
}

// Hook for container queries (responsive based on element size)
export function useContainerQuery<T extends HTMLElement = HTMLElement>(
  breakpoints: Record<string, number>
): [RefObject<T>, Record<string, boolean>] {
  const [ref, size] = useElementSize<T>();
  
  const matches: Record<string, boolean> = {};
  
  for (const [name, minWidth] of Object.entries(breakpoints)) {
    matches[name] = size.width >= minWidth;
  }
  
  return [ref, matches];
}

// Hook for aspect ratio
export function useAspectRatio<T extends HTMLElement = HTMLElement>(): [RefObject<T>, number | null] {
  const [ref, size] = useElementSize<T>();
  
  const aspectRatio = size.height > 0 ? size.width / size.height : null;
  
  return [ref, aspectRatio];
}

// Hook for detecting if element is overflowing
export function useOverflow<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  { horizontal: boolean; vertical: boolean }
] {
  const ref = useRef<T>(null);
  const [overflow, setOverflow] = useState({ horizontal: false, vertical: false });
  
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined' || typeof MutationObserver === 'undefined') return;
    
    const checkOverflow = () => {
      setOverflow({
        horizontal: element.scrollWidth > element.clientWidth,
        vertical: element.scrollHeight > element.clientHeight,
      });
    };
    
    checkOverflow();
    
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    
    // Also observe children for content changes
    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(element, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
  
  return [ref, overflow];
}

// Hook for element bounds (position + size)
export function useElementBounds<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  DOMRect | null
] {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined' || typeof window === 'undefined') return;
    
    const updateBounds = () => {
      setBounds(element.getBoundingClientRect());
    };
    
    updateBounds();
    
    const observer = new ResizeObserver(updateBounds);
    observer.observe(element);
    
    // Also update on scroll
    window.addEventListener('scroll', updateBounds, true);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateBounds, true);
    };
  }, []);
  
  return [ref, bounds];
}

// Utility to observe multiple elements
export function observeElements(
  elements: Element[],
  callback: (entries: ResizeObserverEntry[]) => void,
  options?: ResizeObserverOptions
): () => void {
  if (typeof ResizeObserver === 'undefined') {
    return () => {};
  }

  const observer = new ResizeObserver(callback);
  
  elements.forEach(element => {
    observer.observe(element, options);
  });
  
  return () => observer.disconnect();
}

// Breakpoint utilities
export const defaultBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function getBreakpoint(width: number, breakpoints = defaultBreakpoints): string {
  const sorted = Object.entries(breakpoints).sort(([, a], [, b]) => b - a);
  
  for (const [name, minWidth] of sorted) {
    if (width >= minWidth) {
      return name;
    }
  }
  
  return sorted[sorted.length - 1][0];
}

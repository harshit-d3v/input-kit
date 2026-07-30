import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Array<(e: { matches: boolean }) => void> = [];

  beforeEach(() => {
    listeners = [];
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, listener) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((event, listener) => {
        if (event === 'change') {
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }),
    }));
    
    window.matchMedia = matchMediaMock;
  });

  it('should return false by default', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should return initial match state', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should use default value during SSR', () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-expect-error - simulate SSR
    window.matchMedia = undefined;

    // The mock being removed is on window.matchMedia, not on the module, so the
    // already-imported hook is the right thing to call. `require` is also
    // unavailable in this ESM test environment.
    const { result } = renderHook(() =>
      useMediaQuery('(min-width: 768px)', { defaultValue: true, initializeWithValue: false })
    );
    
    expect(result.current).toBe(true);

    window.matchMedia = originalMatchMedia;
  });

  it('should update when media query changes', async () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);

    // Simulate media query change - wrap in act since it triggers state update
    const { act } = await import('@testing-library/react');
    act(() => {
      listeners.forEach((listener) => {
        listener({ matches: true });
      });
    });

    expect(result.current).toBe(true);
  });

  it('should support different queries', () => {
    renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));
    
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('should clean up listeners on unmount', () => {
    const removeEventListener = vi.fn();
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener,
    }));

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    unmount();
    
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should support legacy addListener/removeListener API', () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener,
      removeListener,
      addEventListener: undefined,
      removeEventListener: undefined,
    }));

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(addListener).toHaveBeenCalled();
    
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });

  it('should update when query changes', () => {
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 768px)');

    rerender({ query: '(min-width: 1024px)' });

    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)');
  });
});

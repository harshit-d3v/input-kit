import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIntersectionObserver } from './useIntersectionObserver';

describe('useIntersectionObserver', () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let callbackRef: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    callbackRef = null;

    class MockIntersectionObserver implements IntersectionObserver {
      observe = observeMock;
      disconnect = disconnectMock;
      unobserve = vi.fn();
      takeRecords = vi.fn();
      root: Element | null = null;
      rootMargin: string = '';
      thresholds: ReadonlyArray<number> = [];

      constructor(callback: IntersectionObserverCallback) {
        callbackRef = callback;
      }
    }

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.intersectionRatio).toBe(0);
    expect(result.current.entry).toBeNull();
    expect(result.current.ref.current).toBeNull();
  });

  it('should observe element when ref is set', async () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Wait for effect to run
    await waitFor(() => {
      expect(observeMock).toHaveBeenCalledWith(element);
    });
  });

  it('should update state when intersection changes', async () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Wait for observer to be created
    await waitFor(() => expect(callbackRef).toBeTruthy());

    act(() => {
      callbackRef!([{
        isIntersecting: true,
        intersectionRatio: 0.5,
        target: element,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      }]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.intersectionRatio).toBe(0.5);
  });

  it('should disconnect on unmount', async () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(observeMock).toHaveBeenCalled());
    
    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should support triggerOnce option', async () => {
    const { result } = renderHook(() => useIntersectionObserver({ triggerOnce: true }));
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(callbackRef).toBeTruthy());

    act(() => {
      callbackRef!([{
        isIntersecting: true,
        intersectionRatio: 0.5,
        target: element,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      }]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should pass options to observer', async () => {
    const { result } = renderHook(() => 
      useIntersectionObserver({
        rootMargin: '10px',
        threshold: 0.5,
      })
    );

    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(observeMock).toHaveBeenCalled());

    // The observer constructor should have been called with the options
    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        root: null,
        rootMargin: '10px',
        threshold: 0.5,
      }
    );
  });

  it('should handle missing IntersectionObserver API gracefully', () => {
    // @ts-expect-error - simulate missing API
    window.IntersectionObserver = undefined;

    const { result } = renderHook(() => useIntersectionObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Should default to visible
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.intersectionRatio).toBe(1);
  });
});

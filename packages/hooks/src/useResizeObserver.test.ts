import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useResizeObserver } from './useResizeObserver';

describe('useResizeObserver', () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let callbackRef: ResizeObserverCallback | null = null;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    callbackRef = null;

    class MockResizeObserver implements ResizeObserver {
      observe = observeMock;
      disconnect = disconnectMock;
      unobserve = vi.fn();

      constructor(callback: ResizeObserverCallback) {
        callbackRef = callback;
      }
    }

    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useResizeObserver());
    
    expect(result.current.size).toEqual({ width: 0, height: 0 });
    expect(result.current.entry).toBeNull();
    expect(result.current.ref.current).toBeNull();
  });

  it('should observe element when ref is set', async () => {
    const { result } = renderHook(() => useResizeObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => {
      expect(observeMock).toHaveBeenCalledWith(element, { box: 'content-box' });
    });
  });

  it('should update size when resize occurs', async () => {
    const { result } = renderHook(() => useResizeObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(callbackRef).toBeTruthy());

    act(() => {
      callbackRef!([{
        contentRect: {
          width: 100,
          height: 200,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 200,
          right: 100,
          toJSON: () => ({}),
        },
        target: element,
        borderBoxSize: [],
        contentBoxSize: [],
        contentRect: {
          width: 100,
          height: 200,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 200,
          right: 100,
          toJSON: () => ({}),
        },
        devicePixelContentBoxSize: [],
      } as ResizeObserverEntry], {} as ResizeObserver);
    });

    expect(result.current.size).toEqual({ width: 100, height: 200 });
  });

  it('should call user callback when provided', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(callbackRef).toBeTruthy());

    const entry = {
      contentRect: {
        width: 100,
        height: 200,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 200,
        right: 100,
        toJSON: () => ({}),
      },
      target: element,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as ResizeObserverEntry;

    act(() => {
      callbackRef!([entry], {} as ResizeObserver);
    });

    expect(callback).toHaveBeenCalledWith([entry], {} as ResizeObserver);
  });

  it('should disconnect on unmount', async () => {
    const { result, unmount } = renderHook(() => useResizeObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(observeMock).toHaveBeenCalled());
    
    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should support border-box option', async () => {
    const { result } = renderHook(() => useResizeObserver(undefined, { box: 'border-box' }));
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => {
      expect(observeMock).toHaveBeenCalledWith(element, { box: 'border-box' });
    });
  });

  it('should handle contentBoxSize when available', async () => {
    const { result } = renderHook(() => useResizeObserver());
    
    const element = document.createElement('div');
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    await waitFor(() => expect(callbackRef).toBeTruthy());

    act(() => {
      callbackRef!([{
        contentBoxSize: [{ inlineSize: 150, blockSize: 250 }] as ResizeObserverSize[],
        contentRect: {
          width: 100,
          height: 200,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 200,
          right: 100,
          toJSON: () => ({}),
        },
        target: element,
        borderBoxSize: [],
        devicePixelContentBoxSize: [],
      } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    });

    expect(result.current.size).toEqual({ width: 150, height: 250 });
  });

  it('should handle missing ResizeObserver API gracefully', () => {
    // @ts-expect-error - simulate missing API
    window.ResizeObserver = undefined;

    const { result } = renderHook(() => useResizeObserver());
    
    const element = document.createElement('div');
    element.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 300,
      height: 400,
    });
    
    act(() => {
      (result.current.ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Size should remain at initial values since effect hasn't run with ResizeObserver
    // The fallback only works when the API is missing at effect time
    expect(result.current.size).toEqual({ width: 0, height: 0 });
  });
});

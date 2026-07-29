import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  let fullscreenElement: Element | null = null;
  let changeListeners: Array<() => void> = [];

  beforeEach(() => {
    fullscreenElement = null;
    changeListeners = [];

    // Mock document methods
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => fullscreenElement,
      configurable: true,
    });

    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    
    // Mock event listeners
    vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'fullscreenchange') {
        changeListeners.push(handler as () => void);
      }
    });

    vi.spyOn(document, 'removeEventListener').mockImplementation((event, handler) => {
      if (event === 'fullscreenchange') {
        const index = changeListeners.indexOf(handler as () => void);
        if (index > -1) {
          changeListeners.splice(index, 1);
        }
      }
    });
  });

  it('should initialize with isFullscreen false', () => {
    const { result } = renderHook(() => useFullscreen());
    
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should enter fullscreen', async () => {
    const element = document.createElement('div');
    element.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => {
      const ref = useRef(element);
      return useFullscreen(ref);
    });

    await act(async () => {
      await result.current.enter();
    });

    expect(element.requestFullscreen).toHaveBeenCalled();
  });

  it('should exit fullscreen', async () => {
    fullscreenElement = document.createElement('div');

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.exit();
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('should toggle fullscreen', async () => {
    const element = document.createElement('div');
    element.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => {
      const ref = useRef(element);
      return useFullscreen(ref);
    });

    // Toggle on
    await act(async () => {
      await result.current.toggle();
    });

    expect(element.requestFullscreen).toHaveBeenCalled();

    // Simulate entering fullscreen
    fullscreenElement = element;
    act(() => {
      changeListeners.forEach((listener) => listener());
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it('should handle fullscreen change events', () => {
    const element = document.createElement('div');

    const { result } = renderHook(() => {
      const ref = useRef(element);
      return useFullscreen(ref);
    });

    expect(result.current.isFullscreen).toBe(false);

    // Simulate entering fullscreen
    fullscreenElement = element;
    act(() => {
      changeListeners.forEach((listener) => listener());
    });

    expect(result.current.isFullscreen).toBe(true);

    // Simulate exiting fullscreen
    fullscreenElement = null;
    act(() => {
      changeListeners.forEach((listener) => listener());
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it('should handle missing fullscreen API', async () => {
    const element = document.createElement('div');
    // @ts-expect-error - simulate missing API
    element.requestFullscreen = undefined;

    const { result } = renderHook(() => {
      const ref = useRef(element);
      return useFullscreen(ref);
    });

    await act(async () => {
      try {
        await result.current.enter();
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Fullscreen API not supported');
  });

  it('should not exit if not in fullscreen', async () => {
    fullscreenElement = null;

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.exit();
    });

    expect(document.exitFullscreen).not.toHaveBeenCalled();
  });

  it('should use document.documentElement when no ref provided', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enter();
    });

    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should handle errors when entering fullscreen', async () => {
    const element = document.createElement('div');
    const error = new Error('Fullscreen denied');
    element.requestFullscreen = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => {
      const ref = useRef(element);
      return useFullscreen(ref);
    });

    await act(async () => {
      try {
        await result.current.enter();
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toEqual(error);
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useFullscreen());

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function)
    );
  });
});

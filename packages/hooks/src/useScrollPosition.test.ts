import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollPosition } from './useScrollPosition';

describe('useScrollPosition', () => {
  let scrollListeners: Array<(e: Event) => void> = [];

  beforeEach(() => {
    scrollListeners = [];
    
    // Reset window scroll
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    // Mock document dimensions
    Object.defineProperty(document.documentElement, 'scrollWidth', { value: 2000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });

    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll') {
        scrollListeners.push(handler as (e: Event) => void);
      }
    });

    vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll') {
        const index = scrollListeners.indexOf(handler as (e: Event) => void);
        if (index > -1) {
          scrollListeners.splice(index, 1);
        }
      }
    });
  });

  it('should initialize with zero position', () => {
    const { result } = renderHook(() => useScrollPosition());
    
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.directionX).toBe('none');
    expect(result.current.directionY).toBe('none');
  });

  it('should track window scroll position', () => {
    const { result } = renderHook(() => useScrollPosition());

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true });

    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });

    expect(result.current.y).toBe(100);
    expect(result.current.directionY).toBe('down');
  });

  it('should track scroll direction', () => {
    const { result } = renderHook(() => useScrollPosition());

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true });
    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });
    expect(result.current.directionY).toBe('down');

    // Scroll down more
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 200, writable: true });
    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });
    expect(result.current.directionY).toBe('down');

    // Scroll up
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true });
    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });
    expect(result.current.directionY).toBe('up');
  });

  it('should calculate max scroll', () => {
    const { result } = renderHook(() => useScrollPosition());

    expect(result.current.maxX).toBe(2000 - 1024);
    expect(result.current.maxY).toBe(2000 - 768);
  });

  it('should support throttling', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScrollPosition(undefined, { throttleDelay: 100 }));

    // First scroll
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true });
    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });

    // Immediate update
    expect(result.current.y).toBe(50);

    // Second scroll within throttle period
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true });
    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });

    // Should not update yet
    expect(result.current.y).toBe(50);

    // Advance past throttle
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.y).toBe(100);
    vi.useRealTimers();
  });

  it('should not track direction when disabled', () => {
    const { result } = renderHook(() => 
      useScrollPosition(undefined, { trackDirection: false })
    );

    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true });
    act(() => {
      scrollListeners.forEach((handler) => handler(new Event('scroll')));
    });

    expect(result.current.y).toBe(100);
    expect(result.current.directionY).toBe('none');
  });

  it('should track element scroll position', () => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollLeft', { value: 0, writable: true });
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(element, 'scrollWidth', { value: 500, writable: true });
    Object.defineProperty(element, 'scrollHeight', { value: 500, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    Object.defineProperty(element, 'clientHeight', { value: 200, writable: true });

    const elementListeners: Array<(e: Event) => void> = [];
    element.addEventListener = vi.fn((event, handler) => {
      if (event === 'scroll') {
        elementListeners.push(handler as (e: Event) => void);
      }
    });
    element.removeEventListener = vi.fn();

    const { result } = renderHook(() => {
      const ref = { current: element };
      return useScrollPosition(ref);
    });

    // Simulate element scroll
    Object.defineProperty(element, 'scrollTop', { value: 50, writable: true });
    act(() => {
      elementListeners.forEach((handler) => handler(new Event('scroll')));
    });

    expect(result.current.y).toBe(50);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useScrollPosition());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });
});

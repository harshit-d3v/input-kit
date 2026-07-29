import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback immediately on first invocation', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    // First call - executes immediately
    act(() => {
      result.current('first');
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('first');

    // Second call within throttle period - should be queued
    act(() => {
      result.current('second');
    });
    expect(callback).toHaveBeenCalledTimes(1); // Not called yet

    // Third call within throttle period - replaces queued call
    act(() => {
      result.current('third');
    });
    expect(callback).toHaveBeenCalledTimes(1); // Still not called

    // Advance past throttle delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('third'); // Last queued call
  });

  it('should allow new calls after throttle period', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance past throttle
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // New call should execute immediately
    act(() => {
      result.current(2);
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(2);
  });

  it('should pass multiple arguments', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current('arg1', 42, { key: 'value' });
    });

    expect(callback).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
  });

  it('should use default delay of 500ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback));

    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should cleanup timer on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useThrottle(callback, 500));

    act(() => {
      result.current();
    });
    
    act(() => {
      result.current();
    });

    unmount();

    // Should not throw
    act(() => {
      vi.advanceTimersByTime(500);
    });
  });

  it('should handle callback updates', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const { result, rerender } = renderHook(
      ({ cb }) => useThrottle(cb, 500),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      result.current();
    });
    expect(callback1).toHaveBeenCalledTimes(1);

    // Change callback
    rerender({ cb: callback2 });

    // Advance past throttle
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // New call should use updated callback
    act(() => {
      result.current();
    });
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

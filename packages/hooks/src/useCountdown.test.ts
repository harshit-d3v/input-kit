import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with given time', () => {
    const { result } = renderHook(() => useCountdown(60));
    
    expect(result.current.timeLeft).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });

  it('should start countdown', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(9);
  });

  it('should pause countdown', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(7);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(7); // Should not change
  });

  it('should reset countdown', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBe(5);

    act(() => {
      result.current.reset();
    });

    expect(result.current.timeLeft).toBe(10);
    expect(result.current.isRunning).toBe(false);
  });

  it('should reset with new time', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    act(() => {
      result.current.resetWith(30);
    });

    expect(result.current.timeLeft).toBe(30);
    expect(result.current.isRunning).toBe(false);
  });

  it('should stop at zero', () => {
    const { result } = renderHook(() => useCountdown(3));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);

    // Should stay at zero
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(0);
  });

  it('should not start if time is zero', () => {
    const { result } = renderHook(() => useCountdown(0));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should use default initial time of 60', () => {
    const { result } = renderHook(() => useCountdown());
    
    expect(result.current.timeLeft).toBe(60);
  });

  it('should handle negative initial time', () => {
    const { result } = renderHook(() => useCountdown(-10));
    
    expect(result.current.timeLeft).toBe(0);
  });

  it('should resume from paused state', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.timeLeft).toBe(7);

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.timeLeft).toBe(5);
  });

  it('should cleanup timer on unmount', () => {
    const { result, unmount } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    unmount();

    // Should not throw
    act(() => {
      vi.advanceTimersByTime(10000);
    });
  });
});

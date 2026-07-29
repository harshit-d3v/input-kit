import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // First update
    rerender({ value: 'update1', delay: 500 });
    
    // Advance partially
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Second update (should reset timer)
    rerender({ value: 'update2', delay: 500 });
    expect(result.current).toBe('initial');

    // Advance to when first timer would have fired
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial'); // Still initial

    // Advance to when second timer fires
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('update2');
  });

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should work with different types', () => {
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    );

    rerenderNumber({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(numberResult.current).toBe(42);

    const { result: objectResult, rerender: rerenderObject } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { a: 1 } } }
    );

    const newObj = { a: 2, b: 3 };
    rerenderObject({ value: newObj });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(objectResult.current).toEqual(newObj);
  });

  it('should cleanup timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    // Should not throw when timer fires after unmount
    act(() => {
      vi.advanceTimersByTime(500);
    });
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial'); // Not yet updated

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });
});

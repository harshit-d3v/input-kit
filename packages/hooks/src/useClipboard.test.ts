import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset clipboard mock
    navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with copied false', () => {
    const { result } = renderHook(() => useClipboard());
    
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Hello World');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World');
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should reset copied state after timeout', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useClipboard(1000));

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should handle clipboard API errors', async () => {
    const error = new Error('Clipboard access denied');
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      try {
        await result.current.copy('test');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toEqual(error);
  });

  it('should handle missing clipboard API', async () => {
    // @ts-expect-error - simulate missing API
    navigator.clipboard = undefined;

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      try {
        await result.current.copy('test');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Clipboard API not available');
  });

  it('should reset state manually', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should use default timeout of 2000ms', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should reset previous state before new copy', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('first');
    });

    expect(result.current.copied).toBe(true);

    // This should reset the copied state before attempting new copy
    const error = new Error('Second copy failed');
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.copy('second');
      } catch {
        // Expected
      }
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toEqual(error);
  });

  it('should cleanup timeout on unmount', async () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useClipboard(5000));

    await act(async () => {
      await result.current.copy('test');
    });

    unmount();

    // Should not throw
    act(() => {
      vi.advanceTimersByTime(5000);
    });
  });
});

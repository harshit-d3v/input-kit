import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBeUndefined();

    await act(async () => rerender({ value: 'second' }));
    expect(result.current).toBe('first');

    await act(async () => rerender({ value: 'third' }));
    expect(result.current).toBe('second');
  });

  it('should work with numbers', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBeUndefined();

    await act(async () => rerender({ value: 1 }));
    expect(result.current).toBe(0);

    await act(async () => rerender({ value: 2 }));
    expect(result.current).toBe(1);
  });

  it('should work with objects', async () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const obj3 = { a: 3 };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    );

    expect(result.current).toBeUndefined();

    await act(async () => rerender({ value: obj2 }));
    expect(result.current).toBe(obj1);

    await act(async () => rerender({ value: obj3 }));
    expect(result.current).toBe(obj2);
  });

  it('should work with arrays', () => {
    const arr1 = [1, 2];
    const arr2 = [3, 4];

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: arr1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: arr2 });
    expect(result.current).toBe(arr1);
  });

  it('should work with null and undefined values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null as string | null } }
    );

    expect(result.current).toBeUndefined();

    await act(async () => rerender({ value: 'value' }));
    expect(result.current).toBeNull();

    await act(async () => rerender({ value: null }));
    expect(result.current).toBe('value');
  });

  it('should not update when value stays the same', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'same' } }
    );

    await act(async () => rerender({ value: 'same' }));
    expect(result.current).toBeUndefined(); // Still undefined because effect hasn't run with different value
  });
});

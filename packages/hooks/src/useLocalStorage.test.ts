import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    vi.clearAllMocks();
    
    // Setup working mock
    localStorage.setItem.mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });
    localStorage.getItem.mockImplementation((key: string) => {
      return storage[key] ?? null;
    });
    localStorage.removeItem.mockImplementation((key: string) => {
      delete storage[key];
    });
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from localStorage', () => {
    storage['test-key'] = JSON.stringify('stored-value');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
  });

  it('should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should remove value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    act(() => {
      result.current[2](); // remove
    });

    expect(result.current[0]).toBe('initial');
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should work with objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('user', initialValue));

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ name: 'Jane', age: 25 })
    );
  });

  it('should work with arrays', () => {
    const { result } = renderHook(() => useLocalStorage('items', [1, 2, 3]));

    act(() => {
      result.current[1]([1, 2, 3, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should handle custom serializer/deserializer', () => {
    const serializer = (v: Date) => v.toISOString();
    const deserializer = (v: string) => new Date(v);
    
    const date = new Date('2024-01-01');
    storage['date-key'] = date.toISOString();
    
    const { result } = renderHook(() => 
      useLocalStorage('date-key', new Date(), { serializer, deserializer })
    );

    expect(result.current[0]).toEqual(date);
  });

  it('should handle storage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    // Should not throw, value should be updated in state but not in storage
    expect(result.current[0]).toBe('updated');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should sync across tabs when storage event fires', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Simulate storage event from another tab
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('from-other-tab'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('from-other-tab');
  });

  it('should not update for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('other-value'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should handle null values in storage event (removal)', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });
});

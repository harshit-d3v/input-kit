import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionStorage } from './useSessionStorage';

describe('useSessionStorage', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    vi.clearAllMocks();
    
    // Setup working mock
    sessionStorage.setItem.mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });
    sessionStorage.getItem.mockImplementation((key: string) => {
      return storage[key] ?? null;
    });
    sessionStorage.removeItem.mockImplementation((key: string) => {
      delete storage[key];
    });
  });

  it('should return initial value when sessionStorage is empty', () => {
    const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from sessionStorage', () => {
    storage['test-key'] = JSON.stringify('stored-value');
    
    const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update sessionStorage when value changes', () => {
    const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
  });

  it('should support functional updates', () => {
    const { result } = renderHook(() => useSessionStorage('counter', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should remove value from sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    act(() => {
      result.current[2](); // remove
    });

    expect(result.current[0]).toBe('initial');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should work with complex objects', () => {
    interface User {
      id: number;
      name: string;
      preferences: {
        theme: string;
        notifications: boolean;
      };
    }

    const initialUser: User = {
      id: 1,
      name: 'John',
      preferences: { theme: 'light', notifications: true },
    };

    const { result } = renderHook(() => useSessionStorage<User>('user', initialUser));

    act(() => {
      result.current[1]((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, theme: 'dark' },
      }));
    });

    expect(result.current[0].preferences.theme).toBe('dark');
  });

  it('should handle custom serializer/deserializer', () => {
    const serializer = (v: Map<string, number>) => JSON.stringify(Array.from(v.entries()));
    const deserializer = (v: string) => new Map<string, number>(JSON.parse(v));
    
    const map = new Map([['a', 1], ['b', 2]]);
    storage['map-key'] = serializer(map);
    
    const { result } = renderHook(() => 
      useSessionStorage('map-key', new Map<string, number>(), { serializer, deserializer })
    );

    expect(result.current[0]).toEqual(map);
  });

  it('should handle storage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    sessionStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    // Value should be updated in state but not in storage
    expect(result.current[0]).toBe('updated');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not sync across tabs (unlike localStorage)', () => {
    const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

    // sessionStorage does not sync across tabs
    // This test verifies the behavior is different from localStorage
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('from-other-tab'),
      });
      window.dispatchEvent(event);
    });

    // Value should remain unchanged since we don't listen for storage events
    // (sessionStorage is per-tab)
    expect(result.current[0]).toBe('initial');
  });
});

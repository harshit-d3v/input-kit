import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus', () => {
  let eventListeners: Record<string, Array<(e?: Event) => void>> = {};

  beforeEach(() => {
    eventListeners = {};
    
    // Mock window.addEventListener
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(handler as (e?: Event) => void);
    });

    vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(handler as (e?: Event) => void);
        if (index > -1) {
          eventListeners[event].splice(index, 1);
        }
      }
    });

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial online status', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.online).toBe(true);
  });

  it('should update when going offline', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
        configurable: true,
      });
      eventListeners['offline']?.forEach((handler) => handler());
    });

    expect(result.current.online).toBe(false);
    expect(result.current.since).toBeInstanceOf(Date);
  });

  it('should update when coming back online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
        configurable: true,
      });
      eventListeners['online']?.forEach((handler) => handler());
    });

    expect(result.current.online).toBe(true);
  });

  it('should return network information when available', () => {
    const mockConnection = {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
      saveData: false,
      type: 'wifi',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: mockConnection,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.downlink).toBe(10);
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.rtt).toBe(50);
    expect(result.current.saveData).toBe(false);
    expect(result.current.type).toBe('wifi');
  });

  it('should update network info on connection change', () => {
    const mockConnection = {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
      saveData: false,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          eventListeners['connectionchange'] = [handler];
        }
      }),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: mockConnection,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.downlink).toBe(10);

    // Simulate connection change
    mockConnection.downlink = 2;
    mockConnection.effectiveType = '3g';

    act(() => {
      eventListeners['connectionchange']?.forEach((handler) => handler());
    });

    expect(result.current.downlink).toBe(2);
    expect(result.current.effectiveType).toBe('3g');
  });

  it('should handle missing connection API', () => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.online).toBe(true);
    expect(result.current.downlink).toBeUndefined();
    expect(result.current.effectiveType).toBeUndefined();
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    // Verify cleanup was called (implementation detail)
    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

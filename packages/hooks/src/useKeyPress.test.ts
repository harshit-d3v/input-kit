import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyPress } from './useKeyPress';

describe('useKeyPress', () => {
  let eventListeners: Record<string, Array<(e: Event) => void>> = {};

  beforeEach(() => {
    eventListeners = {};
    
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(handler as (e: Event) => void);
    });

    vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(handler as (e: Event) => void);
        if (index > -1) {
          eventListeners[event].splice(index, 1);
        }
      }
    });
  });

  it('should call callback when target key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('Enter', callback));

    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(keyEvent));
    });

    expect(callback).toHaveBeenCalledWith(keyEvent);
  });

  it('should not call callback for different keys', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('Enter', callback));

    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(keyEvent));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should support modifier keys', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('s', callback, { 
      modifiers: { ctrl: true } 
    }));

    // Without Ctrl
    const eventWithoutCtrl = new KeyboardEvent('keydown', { key: 's', ctrlKey: false });
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(eventWithoutCtrl));
    });
    expect(callback).not.toHaveBeenCalled();

    // With Ctrl
    const eventWithCtrl = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(eventWithCtrl));
    });
    expect(callback).toHaveBeenCalledWith(eventWithCtrl);
  });

  it('should support multiple modifiers', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('s', callback, { 
      modifiers: { ctrl: true, shift: true } 
    }));

    const correctEvent = new KeyboardEvent('keydown', { 
      key: 's', 
      ctrlKey: true, 
      shiftKey: true 
    });
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(correctEvent));
    });
    expect(callback).toHaveBeenCalled();

    callback.mockClear();

    const wrongEvent = new KeyboardEvent('keydown', { 
      key: 's', 
      ctrlKey: true, 
      shiftKey: false 
    });
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(wrongEvent));
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('should prevent default when specified', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('Enter', callback, { preventDefault: true }));

    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');
    
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(keyEvent));
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should stop propagation when specified', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('Enter', callback, { stopPropagation: true }));

    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const stopPropagationSpy = vi.spyOn(keyEvent, 'stopPropagation');
    
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(keyEvent));
    });

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should support keyup event type', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('Enter', callback, { eventType: 'keyup' }));

    expect(window.addEventListener).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function)
    );
  });

  it('should not listen when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPress('Enter', callback, { enabled: false }));

    expect(window.addEventListener).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyPress('Enter', callback));

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should support custom target element', () => {
    const callback = vi.fn();
    const customTarget = document.createElement('div');
    const addEventListenerSpy = vi.spyOn(customTarget, 'addEventListener');

    renderHook(() => useKeyPress('Enter', callback, { target: customTarget }));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should update when callback changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useKeyPress('Enter', cb),
      { initialProps: { cb: callback1 } }
    );

    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(keyEvent));
    });
    expect(callback1).toHaveBeenCalled();

    rerender({ cb: callback2 });

    const keyEvent2 = new KeyboardEvent('keydown', { key: 'Enter' });
    act(() => {
      eventListeners['keydown']?.forEach((handler) => handler(keyEvent2));
    });
    expect(callback2).toHaveBeenCalled();
  });
});

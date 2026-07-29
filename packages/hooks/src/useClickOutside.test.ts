import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside', () => {
  let eventListeners: Record<string, Array<(e: Event) => void>> = {};

  beforeEach(() => {
    eventListeners = {};
    
    vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(handler as (e: Event) => void);
    });

    vi.spyOn(document, 'removeEventListener').mockImplementation((event, handler) => {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(handler as (e: Event) => void);
        if (index > -1) {
          eventListeners[event].splice(index, 1);
        }
      }
    });
  });

  it('should call callback when clicking outside', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const element = document.createElement('div');
    
    act(() => {
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Simulate click outside
    const outsideElement = document.createElement('span');
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: outsideElement });

    act(() => {
      eventListeners['mousedown']?.forEach((handler) => handler(clickEvent));
    });

    expect(callback).toHaveBeenCalledWith(clickEvent);
  });

  it('should not call callback when clicking inside', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const element = document.createElement('div');
    const childElement = document.createElement('span');
    element.appendChild(childElement);
    
    act(() => {
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Simulate click on child element
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: childElement });

    act(() => {
      eventListeners['mousedown']?.forEach((handler) => handler(clickEvent));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when clicking on the element itself', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const element = document.createElement('div');
    
    act(() => {
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    // Simulate click on the element itself
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: element });

    act(() => {
      eventListeners['mousedown']?.forEach((handler) => handler(clickEvent));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should support touchstart events', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => 
      useClickOutside<HTMLDivElement>(callback, { events: ['touchstart'] })
    );

    const element = document.createElement('div');
    
    act(() => {
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    const outsideElement = document.createElement('span');
    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    Object.defineProperty(touchEvent, 'target', { value: outsideElement });

    act(() => {
      eventListeners['touchstart']?.forEach((handler) => handler(touchEvent));
    });

    expect(callback).toHaveBeenCalledWith(touchEvent);
  });

  it('should not listen when disabled', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => 
      useClickOutside<HTMLDivElement>(callback, { enabled: false })
    );

    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const element = document.createElement('div');
    
    act(() => {
      (result.current as React.MutableRefObject<HTMLDivElement | null>).current = element;
    });

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    );
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    );
  });

  it('should handle null ref gracefully', () => {
    const callback = vi.fn();
    renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    
    act(() => {
      eventListeners['mousedown']?.forEach((handler) => handler(clickEvent));
    });

    // Should not throw and callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });
});

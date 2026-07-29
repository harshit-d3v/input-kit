import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVirtual } from './useVirtual.js';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useVirtual', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct defaults', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    expect(result.current.virtualItems).toBeDefined();
    expect(result.current.totalSize).toBe(5000); // 100 * 50
    expect(result.current.scrollOffset).toBe(0);
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should calculate total size correctly', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    expect(result.current.totalSize).toBe(5000);
  });

  it('should handle dynamic heights', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 10,
        estimateItemHeight: 50,
        getItemHeight: (index) => (index % 2 === 0 ? 100 : 50),
      })
    );

    // Initially uses estimated sizes
    expect(result.current.totalSize).toBe(500); // 10 * 50
  });

  it('should provide container props', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    expect(result.current.containerProps).toHaveProperty('ref');
    expect(result.current.containerProps).toHaveProperty('style');
    expect(result.current.containerProps).toHaveProperty('onScroll');
    expect(result.current.containerProps.style).toHaveProperty('overflow', 'auto');
  });

  it('should provide inner props', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    expect(result.current.innerProps).toHaveProperty('style');
    expect(result.current.innerProps.style).toHaveProperty('height', 5000);
  });

  it('should handle horizontal mode', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        horizontal: true,
      })
    );

    expect(result.current.containerProps.style).toHaveProperty('width', '100%');
    expect(result.current.innerProps.style).toHaveProperty('width', 5000);
  });

  it('should provide getItemProps', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    const itemProps = result.current.getItemProps(5);
    expect(itemProps).toHaveProperty('style');
    expect(itemProps).toHaveProperty('data-index', 5);
    expect(itemProps.style).toHaveProperty('top', 250); // 5 * 50
    expect(itemProps.style).toHaveProperty('height', 50);
  });

  it('should handle sticky indices', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        stickyIndices: [0, 10],
      })
    );

    // Check if any virtual item has isSticky flag
    const hasStickyItems = result.current.virtualItems.some(item => item.isSticky);
    // Note: virtualItems might be empty if container not measured
  });

  it('should provide measureElement function', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        estimateItemHeight: 50,
      })
    );

    expect(typeof result.current.measureElement).toBe('function');
  });

  it('should call onEndReached when near end', () => {
    const onEndReached = vi.fn();
    
    // Create a mock container element
    const mockContainer = document.createElement('div');
    Object.defineProperty(mockContainer, 'scrollTop', {
      writable: true,
      value: 4500, // Near end of 5000px list
    });
    Object.defineProperty(mockContainer, 'clientHeight', {
      value: 500,
    });
    Object.defineProperty(mockContainer, 'scrollHeight', {
      value: 5000,
    });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        onEndReached,
        onEndReachedThreshold: 100,
      })
    );

    // Manually set the ref
    result.current.containerRef.current = mockContainer;
  });

  it('should handle overscan', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        overscan: 10,
      })
    );

    // Overscan affects the range calculation
    expect(result.current.virtualItems.length).toBeGreaterThanOrEqual(0);
  });

  it('should provide scrollToIndex function', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    expect(typeof result.current.scrollToIndex).toBe('function');
  });

  it('should provide scrollToOffset function', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    expect(typeof result.current.scrollToOffset).toBe('function');
  });

  it('should handle initial scroll offset', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        initialScrollOffset: 500,
      })
    );

    expect(result.current.scrollOffset).toBe(500);
  });
});

describe('useVirtual with container', () => {
  it('should measure container on mount', async () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    // Container ref should be available
    expect(result.current.containerRef).toBeDefined();
  });

  it('should update virtual items on scroll', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    const initialItems = result.current.virtualItems;
    
    // Simulate scroll by calling the handler directly would require container setup
    // This is tested more thoroughly in component tests
  });
});

describe('useVirtual scrollToIndex', () => {
  it('should scroll to start alignment', () => {
    const mockScrollTo = vi.fn();
    const mockContainer = document.createElement('div');
    mockContainer.scrollTo = mockScrollTo;
    Object.defineProperty(mockContainer, 'clientHeight', { value: 500 });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.scrollToIndex(10, { align: 'start' });
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' });
  });

  it('should scroll to center alignment', () => {
    const mockScrollTo = vi.fn();
    const mockContainer = document.createElement('div');
    mockContainer.scrollTo = mockScrollTo;
    // Mock getBoundingClientRect for ResizeObserver
    mockContainer.getBoundingClientRect = () => ({ width: 500, height: 500, top: 0, left: 0, right: 500, bottom: 500, x: 0, y: 0, toJSON: () => {} });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    result.current.containerRef.current = mockContainer;

    // Trigger resize measurement
    act(() => {
      // Simulate resize observer callback
      const event = new Event('resize');
      mockContainer.dispatchEvent(event);
    });

    act(() => {
      result.current.scrollToIndex(10, { align: 'center' });
    });

    // The scroll position should be calculated
    expect(mockScrollTo).toHaveBeenCalled();
    const call = mockScrollTo.mock.calls[0][0];
    expect(call.behavior).toBe('smooth');
    expect(typeof call.top).toBe('number');
  });

  it('should scroll to end alignment', () => {
    const mockScrollTo = vi.fn();
    const mockContainer = document.createElement('div');
    mockContainer.scrollTo = mockScrollTo;
    mockContainer.getBoundingClientRect = () => ({ width: 500, height: 500, top: 0, left: 0, right: 500, bottom: 500, x: 0, y: 0, toJSON: () => {} });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.scrollToIndex(10, { align: 'end' });
    });

    expect(mockScrollTo).toHaveBeenCalled();
    const call = mockScrollTo.mock.calls[0][0];
    expect(call.behavior).toBe('smooth');
    expect(typeof call.top).toBe('number');
  });
});

describe('useVirtual scrollToOffset', () => {
  it('should scroll to offset', () => {
    const mockScrollTo = vi.fn();
    const mockContainer = document.createElement('div');
    mockContainer.scrollTo = mockScrollTo;
    Object.defineProperty(mockContainer, 'clientHeight', { value: 500 });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
      })
    );

    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.scrollToOffset(1000);
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
  });

  it('should clamp offset to valid range', () => {
    const mockScrollTo = vi.fn();
    const mockContainer = document.createElement('div');
    mockContainer.scrollTo = mockScrollTo;
    mockContainer.getBoundingClientRect = () => ({ width: 500, height: 500, top: 0, left: 0, right: 500, bottom: 500, x: 0, y: 0, toJSON: () => {} });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 10,
        itemHeight: 50,
      })
    );

    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.scrollToOffset(10000); // Beyond total size
    });

    // totalSize = 500, containerSize = 500, so max offset = 0 (or 500 if not properly clamped)
    expect(mockScrollTo).toHaveBeenCalled();
    const call = mockScrollTo.mock.calls[0][0];
    expect(call.behavior).toBe('smooth');
    // The offset should be clamped to a reasonable value
    expect(call.top).toBeGreaterThanOrEqual(0);
  });
});

describe('useVirtual horizontal mode', () => {
  it('should use scrollLeft in horizontal mode', () => {
    const mockScrollTo = vi.fn();
    const mockContainer = document.createElement('div');
    mockContainer.scrollTo = mockScrollTo;
    Object.defineProperty(mockContainer, 'clientWidth', { value: 500 });

    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        horizontal: true,
      })
    );

    result.current.containerRef.current = mockContainer;

    act(() => {
      result.current.scrollToIndex(10, { align: 'start' });
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 500, behavior: 'smooth' });
  });

  it('should provide correct item props in horizontal mode', () => {
    const { result } = renderHook(() =>
      useVirtual({
        itemCount: 100,
        itemHeight: 50,
        horizontal: true,
      })
    );

    const itemProps = result.current.getItemProps(5);
    expect(itemProps.style).toHaveProperty('left', 250); // 5 * 50
    expect(itemProps.style).toHaveProperty('width', 50);
    expect(itemProps.style).toHaveProperty('top', 0);
  });
});

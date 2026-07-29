import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMeasurementCache,
  calculateUniformRange,
  calculateDynamicRange,
  calculateTotalSize,
  getOffsetForIndex,
  calculateScrollOffset,
  calculateDynamicScrollOffset,
  isNearEnd,
  binarySearchForIndex,
  getStickyOffset,
  DEFAULT_ESTIMATE_SIZE,
  DEFAULT_OVERSCAN,
} from './utils.js';

describe('createMeasurementCache', () => {
  let cache: ReturnType<typeof createMeasurementCache>;

  beforeEach(() => {
    cache = createMeasurementCache();
  });

  it('should store and retrieve measurements', () => {
    cache.set(0, 100);
    expect(cache.get(0)).toBe(100);
  });

  it('should return undefined for unset indices', () => {
    expect(cache.get(0)).toBeUndefined();
  });

  it('should check if index has been measured', () => {
    expect(cache.has(0)).toBe(false);
    cache.set(0, 100);
    expect(cache.has(0)).toBe(true);
  });

  it('should clear all measurements', () => {
    cache.set(0, 100);
    cache.set(1, 200);
    cache.clear();
    expect(cache.get(0)).toBeUndefined();
    expect(cache.get(1)).toBeUndefined();
    expect(cache.has(0)).toBe(false);
  });

  it('should clear measurements from index onwards', () => {
    cache.set(0, 100);
    cache.set(1, 200);
    cache.set(2, 300);
    cache.clearFrom(1);
    expect(cache.get(0)).toBe(100);
    expect(cache.get(1)).toBeUndefined();
    expect(cache.get(2)).toBeUndefined();
  });

  it('should calculate total size', () => {
    cache.set(0, 100);
    cache.set(1, 200);
    const total = cache.getTotalSize(3, 50);
    expect(total).toBe(100 + 200 + 50); // 350
  });

  it('should calculate offset for index', () => {
    cache.set(0, 100);
    cache.set(1, 200);
    const offset = cache.getOffset(2, 50);
    expect(offset).toBe(100 + 200); // 300
  });

  it('should find index at offset', () => {
    cache.set(0, 100);
    cache.set(1, 200);
    cache.set(2, 100);
    expect(cache.getIndexAtOffset(50, 50, 3)).toBe(0);
    expect(cache.getIndexAtOffset(150, 50, 3)).toBe(1);
    expect(cache.getIndexAtOffset(300, 50, 3)).toBe(2);
  });
});

describe('calculateUniformRange', () => {
  it('should calculate correct range for uniform items', () => {
    // Container height 500, item height 50, scroll 0, overscan 2
    const range = calculateUniformRange(0, 500, 50, 100, 2);
    expect(range.startIndex).toBe(0); // 0 - 2, but clamped to 0
    expect(range.endIndex).toBe(12); // 10 visible + 2 overscan
  });

  it('should handle scrolled position', () => {
    // Scrolled 200px down
    const range = calculateUniformRange(200, 500, 50, 100, 2);
    expect(range.startIndex).toBe(2); // 200/50 - 2 = 2
    expect(range.endIndex).toBe(16); // 200/50 + 10 visible + 2 = 16
  });

  it('should not exceed item count', () => {
    const range = calculateUniformRange(0, 500, 50, 10, 2);
    expect(range.endIndex).toBe(9); // clamped to itemCount - 1
  });

  it('should handle overscan correctly', () => {
    const range = calculateUniformRange(100, 300, 50, 100, 5);
    expect(range.startIndex).toBe(0); // 2 - 5, clamped to 0
    expect(range.endIndex).toBe(13); // 2 + 6 + 5 = 13 (6 visible = 300/50)
  });
});

describe('calculateDynamicRange', () => {
  it('should calculate range for dynamic heights', () => {
    const getItemSize = (index: number) => [100, 200, 150, 100, 200][index] ?? 100;
    
    // Scrolled 150px, container 300px
    const range = calculateDynamicRange(150, 300, 5, 1, getItemSize);
    
    // Item 0: 0-100, Item 1: 100-300, Item 2: 300-450
    // Start should be index 1 (overscan 1 brings it to 0)
    expect(range.startIndex).toBe(0);
    // End should include items visible at 150 + 300 = 450
    expect(range.endIndex).toBeGreaterThanOrEqual(2);
  });

  it('should handle all same sizes', () => {
    const getItemSize = () => 100;
    const range = calculateDynamicRange(0, 500, 10, 2, getItemSize);
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(6); // 5 visible + 2 overscan - 1 (inclusive)
  });
});

describe('calculateTotalSize', () => {
  it('should calculate with default size', () => {
    const total = calculateTotalSize(10, 50, () => undefined);
    expect(total).toBe(500);
  });

  it('should use measured sizes when available', () => {
    const cache = new Map<number, number>([[0, 100], [1, 200]]);
    const total = calculateTotalSize(5, 50, (i) => cache.get(i));
    expect(total).toBe(100 + 200 + 50 * 3); // 450
  });
});

describe('getOffsetForIndex', () => {
  it('should calculate offset with default size', () => {
    const offset = getOffsetForIndex(5, 50, () => undefined);
    expect(offset).toBe(250);
  });

  it('should use measured sizes', () => {
    const cache = new Map<number, number>([[0, 100], [1, 200], [2, 150]]);
    const offset = getOffsetForIndex(3, 50, (i) => cache.get(i));
    expect(offset).toBe(100 + 200 + 150); // 450
  });
});

describe('calculateScrollOffset', () => {
  const itemSize = 100;
  const containerSize = 500;
  const totalSize = 10000;

  it('should align to start', () => {
    const offset = calculateScrollOffset(5, itemSize, containerSize, 0, 'start', totalSize);
    expect(offset).toBe(500); // 5 * 100
  });

  it('should align to center', () => {
    const offset = calculateScrollOffset(5, itemSize, containerSize, 0, 'center', totalSize);
    expect(offset).toBe(500 - 250 + 50); // 300
  });

  it('should align to end', () => {
    const offset = calculateScrollOffset(5, itemSize, containerSize, 0, 'end', totalSize);
    expect(offset).toBe(500 - 500 + 100); // 100
  });

  it('should use auto alignment when item is visible', () => {
    // Item 2 at offset 200, container 500, current scroll 0
    const offset = calculateScrollOffset(2, itemSize, containerSize, 0, 'auto', totalSize);
    expect(offset).toBe(0); // Already visible, no scroll needed
  });

  it('should use auto alignment when item is above viewport', () => {
    // Current scroll 500, item 2 at offset 200
    const offset = calculateScrollOffset(2, itemSize, containerSize, 500, 'auto', totalSize);
    expect(offset).toBe(200); // Scroll to show item
  });

  it('should use auto alignment when item is below viewport', () => {
    // Current scroll 0, item 10 at offset 1000
    const offset = calculateScrollOffset(10, itemSize, containerSize, 0, 'auto', totalSize);
    expect(offset).toBe(600); // 1000 + 100 - 500
  });

  it('should clamp to valid range', () => {
    const offset = calculateScrollOffset(0, itemSize, containerSize, 0, 'start', totalSize);
    expect(offset).toBe(0);
  });
});

describe('calculateDynamicScrollOffset', () => {
  const containerSize = 500;
  const totalSize = 10000;
  const getItemOffset = (index: number) => index * 100;
  const getItemSize = () => 100;

  it('should align to start', () => {
    const offset = calculateDynamicScrollOffset(5, containerSize, 0, 'start', totalSize, getItemOffset, getItemSize);
    expect(offset).toBe(500);
  });

  it('should align to center', () => {
    const offset = calculateDynamicScrollOffset(5, containerSize, 0, 'center', totalSize, getItemOffset, getItemSize);
    expect(offset).toBe(300);
  });
});

describe('isNearEnd', () => {
  it('should return true when near end', () => {
    expect(isNearEnd(900, 100, 1000, 0)).toBe(true);
    expect(isNearEnd(850, 100, 1000, 50)).toBe(true);
  });

  it('should return false when not near end', () => {
    expect(isNearEnd(0, 100, 1000, 0)).toBe(false);
    expect(isNearEnd(800, 100, 1000, 0)).toBe(false);
  });

  it('should respect threshold', () => {
    expect(isNearEnd(800, 100, 1000, 150)).toBe(true); // Within 150px of end
    expect(isNearEnd(800, 100, 1000, 50)).toBe(false); // Not within 50px
  });
});

describe('binarySearchForIndex', () => {
  const getItemOffset = (index: number) => index * 100;
  const getItemSize = () => 100;

  it('should find correct index', () => {
    expect(binarySearchForIndex(50, 100, getItemOffset, getItemSize)).toBe(0);
    expect(binarySearchForIndex(150, 100, getItemOffset, getItemSize)).toBe(1);
    expect(binarySearchForIndex(950, 100, getItemOffset, getItemSize)).toBe(9);
  });

  it('should handle edge cases', () => {
    expect(binarySearchForIndex(0, 100, getItemOffset, getItemSize)).toBe(0);
    expect(binarySearchForIndex(9900, 100, getItemOffset, getItemSize)).toBe(99);
  });
});

describe('getStickyOffset', () => {
  const getItemOffset = (index: number) => index * 100;
  const getItemSize = () => 50;

  it('should return 0 when no sticky items', () => {
    expect(getStickyOffset([], 200, getItemOffset, getItemSize)).toBe(0);
  });

  it('should calculate sticky offset', () => {
    // Sticky at index 0 and 2, scroll at 250
    const offset = getStickyOffset([0, 2], 250, getItemOffset, getItemSize);
    // Item 0: offset 0, size 50 -> stickyOffset = 50
    // Item 2: offset 200, size 50 -> stickyOffset = 250
    expect(offset).toBe(250);
  });

  it('should only include sticky items before scroll position', () => {
    const offset = getStickyOffset([0, 5], 250, getItemOffset, getItemSize);
    // Item 0 is before 250 (at offset 0, size 50 -> stickyOffset = 50)
    // Item 5 is at offset 500, which is > 250, so not included
    expect(offset).toBe(50); // 0 + 50 (item 0 offset + size)
  });
});

describe('constants', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_ESTIMATE_SIZE).toBe(50);
    expect(DEFAULT_OVERSCAN).toBe(5);
  });
});

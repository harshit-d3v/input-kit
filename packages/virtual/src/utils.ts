export const DEFAULT_ESTIMATE_SIZE = 50;
export const DEFAULT_OVERSCAN = 5;

/**
 * Binary search for item index at offset
 */
export function findItemAtOffset(
  offsets: number[],
  offset: number,
  start = 0,
  end = offsets.length - 1
): number {
  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    const currentOffset = offsets[middle];

    if (currentOffset === offset) {
      return middle;
    } else if (currentOffset < offset) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }

  return Math.max(0, start - 1);
}

/**
 * Calculate range of visible items
 */
export function calculateRange(
  offsets: number[],
  sizes: number[],
  scrollOffset: number,
  containerSize: number,
  overscan: number
): { start: number; end: number } {
  const count = offsets.length;
  if (count === 0) return { start: 0, end: 0 };

  const startIndex = findItemAtOffset(offsets, scrollOffset);
  const endOffset = scrollOffset + containerSize;
  let endIndex = findItemAtOffset(offsets, endOffset);

  // Include partially visible items
  if (offsets[endIndex] + sizes[endIndex] < endOffset && endIndex < count - 1) {
    endIndex++;
  }

  // Apply overscan
  const overscanStart = Math.max(0, startIndex - overscan);
  const overscanEnd = Math.min(count - 1, endIndex + overscan);

  return { start: overscanStart, end: overscanEnd };
}

/**
 * Build offsets array from sizes
 */
export function buildOffsets(sizes: number[]): number[] {
  const offsets: number[] = [];
  let currentOffset = 0;

  for (let i = 0; i < sizes.length; i++) {
    offsets[i] = currentOffset;
    currentOffset += sizes[i];
  }

  return offsets;
}

/**
 * Get total size from sizes array
 */
export function getTotalSize(sizes: number[]): number {
  return sizes.reduce((sum, size) => sum + size, 0);
}

export function createMeasurementCache() {
  const cache = new Map<number, number>();

  return {
    get: (index: number) => cache.get(index),
    set: (index: number, size: number) => {
      cache.set(index, size);
    },
    has: (index: number) => cache.has(index),
    clear: () => {
      cache.clear();
    },
    clearFrom: (startIndex: number) => {
      Array.from(cache.keys()).forEach((index) => {
        if (index >= startIndex) {
          cache.delete(index);
        }
      });
    },
    getTotalSize: (itemCount: number, defaultSize: number) =>
      calculateTotalSize(itemCount, defaultSize, (index) => cache.get(index)),
    getOffset: (index: number, defaultSize: number) =>
      getOffsetForIndex(index, defaultSize, (itemIndex) => cache.get(itemIndex)),
    getIndexAtOffset: (offset: number, defaultSize: number, itemCount: number) =>
      binarySearchForIndex(
        offset,
        itemCount,
        (index) => getOffsetForIndex(index, defaultSize, (itemIndex) => cache.get(itemIndex)),
        (index) => cache.get(index) ?? defaultSize
      ),
  };
}

export function calculateUniformRange(
  scrollOffset: number,
  containerSize: number,
  itemSize: number,
  itemCount: number,
  overscan: number
): { startIndex: number; endIndex: number } {
  const rawStartIndex = Math.floor(scrollOffset / itemSize);
  const visibleCount = Math.ceil(containerSize / itemSize);

  return {
    startIndex: Math.max(0, rawStartIndex - overscan),
    endIndex: Math.min(itemCount - 1, rawStartIndex + visibleCount + overscan),
  };
}

export function calculateDynamicRange(
  scrollOffset: number,
  containerSize: number,
  itemCount: number,
  overscan: number,
  getItemSize: (index: number) => number
): { startIndex: number; endIndex: number } {
  let accumulated = 0;
  let startIndex = 0;

  while (startIndex < itemCount) {
    const size = getItemSize(startIndex);
    if (accumulated + size > scrollOffset) {
      break;
    }
    accumulated += size;
    startIndex += 1;
  }

  let endIndex = startIndex;
  let visibleSize = accumulated;
  const endOffset = scrollOffset + containerSize;

  while (endIndex < itemCount && visibleSize < endOffset) {
    visibleSize += getItemSize(endIndex);
    endIndex += 1;
  }

  return {
    startIndex: Math.max(0, startIndex - overscan),
    endIndex: Math.min(itemCount - 1, endIndex - 1 + overscan),
  };
}

export function calculateTotalSize(
  itemCount: number,
  defaultSize: number,
  getMeasuredSize: (index: number) => number | undefined
): number {
  return Array.from({ length: itemCount }, (_, index) => getMeasuredSize(index) ?? defaultSize).reduce(
    (sum, size) => sum + size,
    0
  );
}

export function getOffsetForIndex(
  index: number,
  defaultSize: number,
  getMeasuredSize: (index: number) => number | undefined
): number {
  let offset = 0;
  for (let currentIndex = 0; currentIndex < index; currentIndex += 1) {
    offset += getMeasuredSize(currentIndex) ?? defaultSize;
  }
  return offset;
}

export function calculateScrollOffset(
  index: number,
  itemSize: number,
  containerSize: number,
  currentScrollOffset: number,
  align: 'start' | 'center' | 'end' | 'auto',
  totalSize: number
): number {
  const itemOffset = index * itemSize;
  const itemEnd = itemOffset + itemSize;

  let nextOffset = itemOffset;

  if (align === 'center') {
    nextOffset = itemOffset - containerSize / 2 + itemSize / 2;
  } else if (align === 'end') {
    nextOffset = itemEnd - containerSize;
  } else if (align === 'auto') {
    if (itemOffset < currentScrollOffset) {
      nextOffset = itemOffset;
    } else if (itemEnd > currentScrollOffset + containerSize) {
      nextOffset = itemEnd - containerSize;
    } else {
      nextOffset = currentScrollOffset;
    }
  }

  return Math.max(0, Math.min(nextOffset, totalSize - containerSize));
}

export function calculateDynamicScrollOffset(
  index: number,
  containerSize: number,
  currentScrollOffset: number,
  align: 'start' | 'center' | 'end' | 'auto',
  totalSize: number,
  getItemOffset: (index: number) => number,
  getItemSize: (index: number) => number
): number {
  const itemOffset = getItemOffset(index);
  const itemSize = getItemSize(index);
  const itemEnd = itemOffset + itemSize;

  let nextOffset = itemOffset;

  if (align === 'center') {
    nextOffset = itemOffset - containerSize / 2 + itemSize / 2;
  } else if (align === 'end') {
    nextOffset = itemEnd - containerSize;
  } else if (align === 'auto') {
    if (itemOffset < currentScrollOffset) {
      nextOffset = itemOffset;
    } else if (itemEnd > currentScrollOffset + containerSize) {
      nextOffset = itemEnd - containerSize;
    } else {
      nextOffset = currentScrollOffset;
    }
  }

  return Math.max(0, Math.min(nextOffset, totalSize - containerSize));
}

export function isNearEnd(
  scrollOffset: number,
  containerSize: number,
  totalSize: number,
  threshold: number
): boolean {
  return totalSize - (scrollOffset + containerSize) <= threshold;
}

export function binarySearchForIndex(
  offset: number,
  itemCount: number,
  getItemOffset: (index: number) => number,
  getItemSize: (index: number) => number
): number {
  let start = 0;
  let end = itemCount - 1;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    const itemStart = getItemOffset(middle);
    const itemEnd = itemStart + getItemSize(middle);

    if (offset >= itemStart && offset < itemEnd) {
      return middle;
    }

    if (offset < itemStart) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }

  return Math.max(0, Math.min(itemCount - 1, start));
}

export function getStickyOffset(
  stickyIndices: number[],
  scrollOffset: number,
  getItemOffset: (index: number) => number,
  getItemSize: (index: number) => number
): number {
  return stickyIndices.reduce((lastStickyEnd, index) => {
    const itemOffset = getItemOffset(index);
    if (itemOffset > scrollOffset) {
      return lastStickyEnd;
    }

    return itemOffset + getItemSize(index);
  }, 0);
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
): T {
  let lastTime = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * Get scroll position from event
 */
export function getScrollOffset(
  element: HTMLElement,
  horizontal: boolean
): number {
  return horizontal ? element.scrollLeft : element.scrollTop;
}

/**
 * Set scroll position
 */
export function setScrollOffset(
  element: HTMLElement,
  offset: number,
  horizontal: boolean
): void {
  if (horizontal) {
    element.scrollLeft = offset;
  } else {
    element.scrollTop = offset;
  }
}

/**
 * Calculate grid dimensions
 */
export function calculateGridDimensions(
  count: number,
  columnCount: number,
  cellWidth: number,
  cellHeight: number,
  horizontalGap = 0,
  verticalGap = 0
): { rowCount: number; totalWidth: number; totalHeight: number } {
  const rowCount = Math.ceil(count / columnCount);
  const totalWidth = columnCount * cellWidth + (columnCount - 1) * horizontalGap;
  const totalHeight = rowCount * cellHeight + (rowCount - 1) * verticalGap;
  return { rowCount, totalWidth, totalHeight };
}

/**
 * Get cell position in grid
 */
export function getCellPosition(
  index: number,
  columnCount: number,
  cellWidth: number,
  cellHeight: number,
  horizontalGap = 0,
  verticalGap = 0
): { row: number; column: number; x: number; y: number } {
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;
  const x = column * (cellWidth + horizontalGap);
  const y = row * (cellHeight + verticalGap);
  return { row, column, x, y };
}

/**
 * Check if element is near bottom for infinite scroll
 */
export function isNearBottom(
  element: HTMLElement,
  threshold: number
): boolean {
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  return scrollHeight - scrollTop - clientHeight < threshold;
}

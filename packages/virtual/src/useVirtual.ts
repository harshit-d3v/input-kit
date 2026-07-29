import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import type { VirtualOptions, UseVirtualReturn, VirtualItem } from './types';
import {
  calculateRange,
  buildOffsets,
  getTotalSize,
  getScrollOffset,
  setScrollOffset,
} from './utils';

export function useVirtual(options: VirtualOptions): UseVirtualReturn {
  const {
    count: countProp,
    itemCount,
    itemSize: itemSizeProp,
    itemHeight,
    estimateSize: estimateSizeProp,
    estimateItemHeight,
    getItemSize: getItemSizeProp,
    height = 0,
    width,
    overscan = 5,
    horizontal = false,
    initialScrollOffset = 0,
    stickyIndices = [],
    onScroll,
    onRangeChange,
    onEndReached,
    onEndReachedThreshold = 0,
  } = options;

  const count = countProp ?? itemCount ?? 0;
  const itemSize = itemSizeProp ?? itemHeight;
  const estimateSize = estimateSizeProp ?? estimateItemHeight ?? 50;
  const getItemSize = getItemSizeProp;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollOffset, setScrollOffsetState] = useState(initialScrollOffset);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endReachedRef = useRef(false);

  // Track measured sizes for dynamic heights
  const measuredSizesRef = useRef<Map<number, number>>(new Map());
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  // Get size for item at index
  const getSize = useCallback(
    (index: number): number => {
      if (itemSize !== undefined) return itemSize;
      if (getItemSize) return getItemSize(index);
      return measuredSizesRef.current.get(index) ?? estimateSize;
    },
    [itemSize, getItemSize, estimateSize]
  );

  // Build sizes array
  const sizes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => getSize(i));
  }, [count, getSize]);

  // Build offsets array
  const offsets = useMemo(() => buildOffsets(sizes), [sizes]);

  // Total size
  const totalSize = useMemo(() => getTotalSize(sizes), [sizes]);

  // Container size
  const containerSize = horizontal
    ? typeof width === 'number'
      ? width
      : containerRef.current?.clientWidth ?? 0
    : height;

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const range = calculateRange(
      offsets,
      sizes,
      scrollOffset,
      containerSize,
      overscan
    );
    return { startIndex: range.start, endIndex: range.end };
  }, [offsets, sizes, scrollOffset, containerSize, overscan]);

  // Build virtual items
  const virtualItems = useMemo<VirtualItem[]>(() => {
    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex && i < count; i++) {
      items.push({
        index: i,
        start: offsets[i],
        size: sizes[i],
        end: offsets[i] + sizes[i],
        key: i,
        isSticky: stickyIndices.includes(i),
      });
    }
    return items;
  }, [startIndex, endIndex, count, offsets, sizes, stickyIndices]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const offset = getScrollOffset(element, horizontal);
      setScrollOffsetState(offset);
      onScroll?.(offset);

      // Set scrolling state
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    },
    [horizontal, onScroll]
  );

  // Scroll to offset
  const scrollToOffset = useCallback(
    (offset: number, behavior: ScrollBehavior = 'smooth') => {
      if (containerRef.current) {
        const targetOffset = Math.max(0, Math.min(offset, totalSize - containerSize));

        if (typeof containerRef.current.scrollTo === 'function') {
          containerRef.current.scrollTo(
            horizontal
              ? { left: targetOffset, behavior }
              : { top: targetOffset, behavior }
          );
        } else {
          setScrollOffset(containerRef.current, targetOffset, horizontal);
        }
      }
    },
    [containerSize, horizontal, totalSize]
  );

  const scrollTo = useCallback(
    (offset: number) => {
      scrollToOffset(offset, 'auto');
    },
    [scrollToOffset]
  );

  // Scroll to index
  const scrollToIndex = useCallback(
    (
      index: number,
      alignOrOptions:
        | 'start'
        | 'center'
        | 'end'
        | 'auto'
        | { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: ScrollBehavior } = 'auto'
    ) => {
      if (!containerRef.current || index < 0 || index >= count) return;

      const options =
        typeof alignOrOptions === 'string'
          ? { align: alignOrOptions, behavior: 'smooth' as ScrollBehavior }
          : { align: 'auto' as const, behavior: 'smooth' as ScrollBehavior, ...alignOrOptions };

      const itemOffset = offsets[index];
      const itemSize = sizes[index];
      let targetOffset: number;

      switch (options.align) {
        case 'start':
          targetOffset = itemOffset;
          break;
        case 'center':
          targetOffset = itemOffset - containerSize / 2 + itemSize / 2;
          break;
        case 'end':
          targetOffset = itemOffset - containerSize + itemSize;
          break;
        case 'auto':
        default:
          if (itemOffset < scrollOffset) {
            targetOffset = itemOffset;
          } else if (itemOffset + itemSize > scrollOffset + containerSize) {
            targetOffset = itemOffset - containerSize + itemSize;
          } else {
            return;
          }
      }

      targetOffset = Math.max(0, Math.min(targetOffset, totalSize - containerSize));
      scrollToOffset(targetOffset, options.behavior);
    },
    [offsets, sizes, containerSize, scrollOffset, totalSize, scrollToOffset, count]
  );

  // Measure item (for dynamic heights)
  const measure = useCallback((index: number) => {
    if (!containerRef.current) return;

    const itemElement = containerRef.current.querySelector(
      `[data-index="${index}"]`
    ) as HTMLElement | null;

    if (itemElement) {
      const size = horizontal
        ? itemElement.getBoundingClientRect().width
        : itemElement.getBoundingClientRect().height;
      measuredSizesRef.current.set(index, size);
    }
  }, [horizontal]);

  const measureElement = useCallback(
    (element: Element | null) => {
      if (!(element instanceof HTMLElement)) return;

      const index = Number(element.getAttribute('data-index'));
      if (!Number.isFinite(index)) return;

      const size = horizontal
        ? element.getBoundingClientRect().width
        : element.getBoundingClientRect().height;
      measuredSizesRef.current.set(index, size);
    },
    [horizontal]
  );

  // Measure all items
  const measureAll = useCallback(() => {
    if (!containerRef.current) return;

    const itemElements = containerRef.current.querySelectorAll('[data-index]');
    itemElements.forEach((el) => {
      const index = parseInt(el.getAttribute('data-index') || '0', 10);
      const size = horizontal
        ? (el as HTMLElement).getBoundingClientRect().width
        : (el as HTMLElement).getBoundingClientRect().height;
      measuredSizesRef.current.set(index, size);
    });
  }, [horizontal]);

  // Call range change callback
  useEffect(() => {
    onRangeChange?.(startIndex, endIndex);
  }, [startIndex, endIndex, onRangeChange]);

  useEffect(() => {
    if (!onEndReached) {
      return;
    }

    const distanceFromEnd = totalSize - (scrollOffset + containerSize);
    if (distanceFromEnd <= onEndReachedThreshold) {
      if (!endReachedRef.current) {
        endReachedRef.current = true;
        onEndReached();
      }
      return;
    }

    endReachedRef.current = false;
  }, [containerSize, onEndReached, onEndReachedThreshold, scrollOffset, totalSize]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    height: horizontal ? '100%' : height,
    width: horizontal ? width ?? '100%' : width ?? '100%',
    overflow: 'auto',
    position: 'relative',
  };

  const contentStyle: React.CSSProperties = {
    height: horizontal ? '100%' : totalSize,
    width: horizontal ? totalSize : '100%',
    position: 'relative',
  };

  return {
    virtualItems,
    totalSize,
    startIndex,
    endIndex,
    scrollOffset,
    isScrolling,
    containerRef,
    containerProps: {
      ref: setContainerRef,
      style: containerStyle,
      onScroll: handleScroll,
    },
    contentProps: {
      style: contentStyle,
    },
    getItemProps: (index: number) => ({
      style: {
        position: 'absolute',
        top: horizontal ? 0 : offsets[index],
        left: horizontal ? offsets[index] : 0,
        height: horizontal ? '100%' : sizes[index],
        width: horizontal ? sizes[index] : '100%',
      },
      'data-index': index,
    }),
    scrollTo,
    scrollToOffset,
    scrollToIndex,
    measure,
    measureElement,
    measureAll,
    innerProps: {
      style: contentStyle,
    },
  };
}

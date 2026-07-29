import React, { useCallback, useEffect, useMemo, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { VirtualGridProps } from './types.js';

/**
 * Imperative handle for VirtualGrid
 */
export interface VirtualGridRef {
  /** Scroll to a specific index */
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: ScrollBehavior }) => void;
  /** Scroll to a specific offset */
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  /** Scroll to top */
  scrollToTop: (behavior?: ScrollBehavior) => void;
  /** Scroll to bottom */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/**
 * Virtual item for grid
 */
interface GridVirtualItem {
  index: number;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * VirtualGrid component for efficiently rendering large grids
 * 
 * @example
 * ```tsx
 * <VirtualGrid
 *   items={items}
 *   columnCount={3}
 *   itemWidth={200}
 *   itemHeight={150}
 *   height={600}
 *   renderItem={(item, index, style) => (
 *     <div style={style}>{item}</div>
 *   )}
 * />
 * ```
 */
function VirtualGridInner<T>(props: VirtualGridProps<T>, ref: React.ForwardedRef<VirtualGridRef>) {
  const {
    items,
    columnCount,
    cellWidth,
    cellHeight,
    estimateItemWidth = cellWidth ?? 200,
    estimateItemHeight = cellHeight ?? 150,
    getItemSize: getItemSizeProp,
    renderItem,
    height,
    width = '100%',
    gap = 0,
    overscan = 2,
    className,
    style: containerStyle,
    onEndReached,
    onEndReachedThreshold = 0,
    initialScrollIndex,
    onScroll,
    getItemKey = (_, index) => index,
    emptyComponent,
    isLoading = false,
    loadingComponent,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const endReachedCalledRef = useRef(false);
  const measurementCacheRef = useRef(new Map<number, { width: number; height: number }>());

  const rowCount = Math.ceil(items.length / columnCount);

  // Measure container size
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(element);
    
    const rect = element.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });

    return () => resizeObserver.disconnect();
  }, []);

  // Get item size
  const getItemSize = useCallback((index: number): { width: number; height: number } => {
    const cached = measurementCacheRef.current.get(index);
    if (cached) return cached;
    
    if (getItemSizeProp && items[index]) {
      return getItemSizeProp(items[index]!, index);
    }
    
    return {
      width: cellWidth ?? estimateItemWidth,
      height: cellHeight ?? estimateItemHeight,
    };
  }, [items, cellWidth, cellHeight, estimateItemWidth, estimateItemHeight, getItemSizeProp]);

  // Get row height
  const getRowHeight = useCallback((rowIndex: number): number => {
    let maxHeight = 0;
    for (let col = 0; col < columnCount; col++) {
      const index = rowIndex * columnCount + col;
      if (index < items.length) {
        const size = getItemSize(index);
        maxHeight = Math.max(maxHeight, size.height);
      }
    }
    return maxHeight + gap;
  }, [items.length, columnCount, gap, getItemSize]);

  // Calculate row offsets
  const rowOffsets = useMemo(() => {
    const offsets: number[] = [];
    let offset = 0;
    for (let i = 0; i < rowCount; i++) {
      offsets[i] = offset;
      offset += getRowHeight(i);
    }
    return offsets;
  }, [rowCount, getRowHeight]);

  // Total height
  const totalHeight = useMemo(() => {
    if (rowOffsets.length === 0) return 0;
    const lastRow = rowCount - 1;
    return rowOffsets[lastRow]! + getRowHeight(lastRow) - gap;
  }, [rowOffsets, rowCount, getRowHeight, gap]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (containerSize.height === 0) {
      return { startRow: 0, endRow: Math.min(overscan * 2, rowCount - 1) };
    }

    let startRow = 0;
    for (let i = 0; i < rowCount; i++) {
      if (rowOffsets[i]! + getRowHeight(i) > scrollOffset) {
        startRow = i;
        break;
      }
    }
    startRow = Math.max(0, startRow - overscan);

    let endRow = startRow;
    let currentOffset = rowOffsets[startRow] ?? 0;
    while (endRow < rowCount && currentOffset < scrollOffset + containerSize.height) {
      currentOffset += getRowHeight(endRow);
      endRow++;
    }
    endRow = Math.min(rowCount - 1, endRow + overscan - 1);

    return { startRow, endRow };
  }, [scrollOffset, containerSize.height, rowCount, rowOffsets, getRowHeight, overscan]);

  // Generate virtual items
  const virtualItems = useMemo<GridVirtualItem[]>(() => {
    const items_list: GridVirtualItem[] = [];
    const { startRow, endRow } = visibleRange;

    for (let row = startRow; row <= endRow; row++) {
      const y = rowOffsets[row] ?? 0;
      const rowHeight = getRowHeight(row) - gap;

      for (let col = 0; col < columnCount; col++) {
        const index = row * columnCount + col;
        if (index >= items.length) break;

        const size = getItemSize(index);
        
        // Calculate x position based on column
        let x = 0;
        for (let c = 0; c < col; c++) {
          const prevIndex = row * columnCount + c;
          if (prevIndex < items.length) {
            x += getItemSize(prevIndex).width + gap;
          }
        }

        items_list.push({
          index,
          row,
          column: col,
          x,
          y,
          width: size.width,
          height: rowHeight,
        });
      }
    }

    return items_list;
  }, [visibleRange, rowOffsets, getRowHeight, columnCount, items.length, getItemSize, gap]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    const newScrollOffset = element.scrollTop;
    setScrollOffset(newScrollOffset);

    // Check for infinite scroll
    if (onEndReached && !endReachedCalledRef.current) {
      if (newScrollOffset + containerSize.height >= totalHeight - onEndReachedThreshold) {
        endReachedCalledRef.current = true;
        onEndReached();
      }
    }

    if (newScrollOffset + containerSize.height < totalHeight - onEndReachedThreshold) {
      endReachedCalledRef.current = false;
    }

    onScroll?.(newScrollOffset);
  }, [containerSize.height, totalHeight, onEndReached, onEndReachedThreshold, onScroll]);

  // Scroll to index
  const scrollToIndex = useCallback((index: number, options: { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: ScrollBehavior } = {}) => {
    const { align = 'auto', behavior = 'smooth' } = options;
    const element = containerRef.current;
    if (!element) return;

    const row = Math.floor(index / columnCount);
    const rowOffset = rowOffsets[row] ?? 0;
    const rowHeight = getRowHeight(row);

    let targetOffset: number;
    switch (align) {
      case 'start':
        targetOffset = rowOffset;
        break;
      case 'center':
        targetOffset = rowOffset - containerSize.height / 2 + rowHeight / 2;
        break;
      case 'end':
        targetOffset = rowOffset + rowHeight - containerSize.height;
        break;
      case 'auto':
      default:
        if (rowOffset < scrollOffset) {
          targetOffset = rowOffset;
        } else if (rowOffset + rowHeight > scrollOffset + containerSize.height) {
          targetOffset = rowOffset + rowHeight - containerSize.height;
        } else {
          targetOffset = scrollOffset;
        }
        break;
    }

    targetOffset = Math.max(0, Math.min(targetOffset, totalHeight - containerSize.height));
    element.scrollTo({ top: targetOffset, behavior });
  }, [columnCount, rowOffsets, getRowHeight, containerSize.height, scrollOffset, totalHeight]);

  // Scroll to offset
  const scrollToOffset = useCallback((offset: number, behavior: ScrollBehavior = 'smooth') => {
    const element = containerRef.current;
    if (!element) return;
    const clampedOffset = Math.max(0, Math.min(offset, totalHeight - containerSize.height));
    element.scrollTo({ top: clampedOffset, behavior });
  }, [totalHeight, containerSize.height]);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    scrollToIndex,
    scrollToOffset,
    scrollToTop: (behavior = 'smooth') => scrollToOffset(0, behavior),
    scrollToBottom: (behavior = 'smooth') => scrollToOffset(totalHeight, behavior),
  }), [scrollToIndex, scrollToOffset, totalHeight]);

  // Initial scroll
  useEffect(() => {
    if (initialScrollIndex !== undefined && initialScrollIndex >= 0) {
      scrollToIndex(initialScrollIndex, { align: 'start', behavior: 'auto' });
    }
  }, []);

  // Measure element
  const measureElement = useCallback((element: HTMLElement | null, index: number) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    measurementCacheRef.current.set(index, { width: rect.width, height: rect.height });
  }, []);

  // Container styles
  const outerStyle: CSSProperties = useMemo(() => ({
    ...containerStyle,
    height,
    width,
    overflow: 'auto',
    position: 'relative',
  }), [containerStyle, height, width]);

  // Inner container styles
  const innerStyle: CSSProperties = useMemo(() => ({
    position: 'relative',
    height: totalHeight,
    width: '100%',
    minHeight: totalHeight,
  }), [totalHeight]);

  // Render items
  const renderedItems = useMemo(() => {
    return virtualItems.map((virtualItem) => {
      const item = items[virtualItem.index]!;
      const key = getItemKey(item, virtualItem.index);

      const itemStyle: CSSProperties = {
        position: 'absolute',
        left: virtualItem.x,
        top: virtualItem.y,
        width: virtualItem.width,
        height: virtualItem.height,
        boxSizing: 'border-box',
      };

      return (
        <div
          key={key}
          ref={(el) => measureElement(el, virtualItem.index)}
          data-index={virtualItem.index}
          style={itemStyle}
        >
          {renderItem(item, virtualItem.index, itemStyle)}
        </div>
      );
    });
  }, [virtualItems, items, getItemKey, renderItem, measureElement]);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={outerStyle}
      >
        {emptyComponent ?? <div style={{ padding: 16, textAlign: 'center' }}>No items</div>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={outerStyle}
      onScroll={handleScroll}
    >
      <div style={innerStyle}>
        {renderedItems}
      </div>
      {isLoading && loadingComponent}
    </div>
  );
}

export const VirtualGrid = forwardRef(VirtualGridInner) as <T>(
  props: VirtualGridProps<T> & { ref?: React.ForwardedRef<VirtualGridRef> }
) => ReactNode;

(VirtualGrid as unknown as { displayName: string }).displayName = 'VirtualGrid';

export default VirtualGrid;

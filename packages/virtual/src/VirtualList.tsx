import React, { forwardRef, useImperativeHandle } from 'react';
import { useVirtual } from './useVirtual';
import type { VirtualListProps } from './types';

export interface VirtualListRef {
  scrollTo: (offset: number) => void;
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  scrollToIndex: (
    index: number,
    align?: 'start' | 'center' | 'end' | 'auto' | { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: ScrollBehavior }
  ) => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  measure: (index: number) => void;
  measureElement: (element: Element | null) => void;
  measureAll: () => void;
}

export const VirtualList = forwardRef(function VirtualList<T>(
  props: VirtualListProps<T>,
  ref: React.Ref<VirtualListRef>
) {
  const {
    items,
    renderItem,
    keyExtractor,
    getItemKey,
    itemSize,
    itemHeight,
    estimateSize,
    estimateItemHeight,
    getItemSize,
    getItemHeight,
    height,
    width,
    overscan = 5,
    horizontal = false,
    className,
    itemClassName,
    style,
    emptyComponent,
    loading,
    isLoading,
    loadingComponent,
    initialScrollOffset,
    stickyIndices,
    onScroll,
    onRangeChange,
    onEndReached,
    onEndReachedThreshold,
  } = props;

  const resolvedKeyExtractor = keyExtractor ?? getItemKey ?? ((_: T, index: number) => index);
  const resolvedItemSize = itemSize ?? itemHeight;
  const resolvedEstimateSize = estimateSize ?? estimateItemHeight;
  const resolvedGetItemSize = getItemSize
    ? getItemSize
    : getItemHeight
    ? (index: number) => (getItemHeight as unknown as (item: T, index: number) => number)(items[index] as T, index)
    : undefined;
  const isLoadingState = loading ?? isLoading ?? false;

  const {
    virtualItems,
    containerProps,
    contentProps,
    getItemProps,
    scrollTo,
    scrollToOffset,
    scrollToIndex,
    measure,
    measureElement,
    measureAll,
    totalSize,
  } = useVirtual({
    count: items.length,
    itemSize: resolvedItemSize,
    estimateSize: resolvedEstimateSize,
    getItemSize: resolvedGetItemSize,
    height,
    width,
    overscan,
    horizontal,
    initialScrollOffset,
    stickyIndices,
    onScroll,
    onRangeChange,
    onEndReached,
    onEndReachedThreshold,
  });

  useImperativeHandle(ref, () => ({
    scrollTo,
    scrollToOffset,
    scrollToIndex,
    scrollToTop: (behavior = 'smooth') => scrollToOffset(0, behavior),
    scrollToBottom: (behavior = 'smooth') => scrollToOffset(totalSize, behavior),
    measure,
    measureElement,
    measureAll,
  }), [measure, measureAll, measureElement, scrollTo, scrollToIndex, scrollToOffset, totalSize]);

  if (isLoadingState) {
    return (
      <div className={className} style={{ ...containerProps.style, ...style }}>
        {loadingComponent || <div>Loading...</div>}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={className} style={{ ...containerProps.style, ...style }}>
        {emptyComponent || <div>No items</div>}
      </div>
    );
  }

  return (
    <div {...containerProps} className={className} style={{ ...containerProps.style, ...style }}>
      <div {...contentProps}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = resolvedKeyExtractor(item, virtualItem.index);
          const itemProps = getItemProps(virtualItem.index);

          return (
            <div
              key={key}
              className={itemClassName}
              style={itemProps.style}
              data-index={virtualItem.index}
            >
              {renderItem(item, virtualItem.index, itemProps.style)}
            </div>
          );
        })}
      </div>
    </div>
  );
}) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<VirtualListRef> }
) => React.ReactElement;

export default VirtualList;

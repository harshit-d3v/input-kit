import type { MutableRefObject, ReactNode, RefCallback } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
  key: string | number;
  isSticky?: boolean;
}

export interface VirtualOptions {
  /** Total number of items */
  count?: number;
  /** Legacy alias for count */
  itemCount?: number;
  /** Fixed item height (for uniform lists) */
  itemSize?: number;
  /** Legacy alias for itemSize */
  itemHeight?: number;
  /** Estimate item height (for dynamic lists) */
  estimateSize?: number;
  /** Legacy alias for estimateSize */
  estimateItemHeight?: number;
  /** Get actual item height (for dynamic lists) */
  getItemSize?: (index: number) => number;
  /** Legacy alias for getItemSize */
  getItemHeight?: (index: number) => number;
  /** Height of the scrollable container */
  height?: number;
  /** Width of the scrollable container (for horizontal) */
  width?: number | string;
  /** Number of extra items to render outside viewport */
  overscan?: number;
  /** Scroll direction */
  horizontal?: boolean;
  /** Initial scroll offset */
  initialScrollOffset?: number;
  /** Sticky item indices */
  stickyIndices?: number[];
  /** Callback when scroll offset changes */
  onScroll?: (offset: number) => void;
  /** Callback when visible range changes */
  onRangeChange?: (start: number, end: number) => void;
  /** Callback when the viewport reaches the end threshold */
  onEndReached?: () => void;
  /** Distance from the end before onEndReached fires */
  onEndReachedThreshold?: number;
}

export interface VirtualListState {
  /** Virtual items to render */
  virtualItems: VirtualItem[];
  /** Total height/width of all items */
  totalSize: number;
  /** Start index of visible range */
  startIndex: number;
  /** End index of visible range */
  endIndex: number;
  /** Current scroll offset */
  scrollOffset: number;
  /** Whether scrolling is happening */
  isScrolling: boolean;
}

export interface VirtualListActions {
  /** Scroll to specific offset */
  scrollTo: (offset: number) => void;
  /** Scroll to specific offset with behavior */
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  /** Scroll to specific item index */
  scrollToIndex: (
    index: number,
    align?:
      | 'start'
      | 'center'
      | 'end'
      | 'auto'
      | { align?: 'start' | 'center' | 'end' | 'auto'; behavior?: ScrollBehavior }
  ) => void;
  /** Measure item at index (for dynamic heights) */
  measure: (index: number) => void;
  /** Measure item from a DOM element */
  measureElement: (element: Element | null) => void;
  /** Measure all items */
  measureAll: () => void;
}

export interface UseVirtualReturn extends VirtualListState, VirtualListActions {
  /** Ref for the scroll container */
  containerRef: MutableRefObject<HTMLDivElement | null>;
  /** Props to spread on the container */
  containerProps: {
    ref: RefCallback<HTMLDivElement>;
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
  /** Props for the content wrapper */
  contentProps: {
    style: React.CSSProperties;
  };
  /** Legacy alias for contentProps */
  innerProps: {
    style: React.CSSProperties;
  };
  /** Get props for a virtual item */
  getItemProps: (index: number) => {
    style: React.CSSProperties;
    'data-index': number;
  };
}

export interface VirtualListProps<T> extends Omit<VirtualOptions, 'count'> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number, style: React.CSSProperties) => ReactNode;
  /** Unique key extractor */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Legacy alias for keyExtractor */
  getItemKey?: (item: T, index: number) => string | number;
  /** CSS class for container */
  className?: string;
  /** CSS class for item */
  itemClassName?: string;
  /** Inline styles for container */
  style?: React.CSSProperties;
  /** Empty state */
  emptyComponent?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Legacy alias for loading */
  isLoading?: boolean;
  loadingComponent?: ReactNode;
}

export interface VirtualGridOptions {
  /** Total number of items */
  count: number;
  /** Number of columns */
  columnCount: number;
  /** Width of each cell */
  cellWidth: number;
  /** Height of each cell */
  cellHeight: number;
  /** Width of the container */
  width: number;
  /** Height of the container */
  height: number;
  /** Extra items to render */
  overscan?: number;
  /** Horizontal gap between cells */
  horizontalGap?: number;
  /** Vertical gap between cells */
  verticalGap?: number;
}

export interface VirtualGridCell {
  index: number;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  key: string | number;
}

export interface VirtualGridState {
  cells: VirtualGridCell[];
  totalWidth: number;
  totalHeight: number;
  visibleRowStart: number;
  visibleRowEnd: number;
  visibleColumnStart: number;
  visibleColumnEnd: number;
}

export interface VirtualGridProps<T> extends Omit<VirtualGridOptions, 'count'> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  estimateItemWidth?: number;
  estimateItemHeight?: number;
  getItemSize?: (item: T, index: number) => { width: number; height: number };
  gap?: number;
  style?: React.CSSProperties;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  initialScrollIndex?: number;
  onScroll?: (offset: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
  emptyComponent?: ReactNode;
  isLoading?: boolean;
  loadingComponent?: ReactNode;
  className?: string;
  cellClassName?: string;
}

export interface InfiniteScrollOptions {
  /** Whether more data is available */
  hasMore: boolean;
  /** Callback to load more data */
  onLoadMore: () => void | Promise<void>;
  /** Distance from bottom to trigger load (px) */
  threshold?: number;
  /** Whether currently loading */
  isLoading?: boolean;
}

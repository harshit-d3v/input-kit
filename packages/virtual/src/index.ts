// Main exports
export { useVirtual } from './useVirtual';
export { VirtualList } from './VirtualList';
export type { VirtualListRef } from './VirtualList';
export { VirtualGrid } from './VirtualGrid';
export type { VirtualGridRef } from './VirtualGrid';

// Types
export type {
  VirtualOptions,
  VirtualItem,
  VirtualListState,
  VirtualListActions,
  UseVirtualReturn,
  VirtualListProps,
  VirtualGridOptions,
  VirtualGridCell,
  VirtualGridState,
  VirtualGridProps,
  InfiniteScrollOptions,
} from './types';

// Utilities
export {
  findItemAtOffset,
  calculateRange,
  buildOffsets,
  getTotalSize,
  throttle,
  debounce,
  getScrollOffset,
  setScrollOffset,
  calculateGridDimensions,
  getCellPosition,
  isNearBottom,
} from './utils';

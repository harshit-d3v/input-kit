import type { ReactNode, CSSProperties } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

export interface FilterState {
  [key: string]: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Column<T = unknown> {
  key: string;
  header: ReactNode;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  accessor?: (row: T) => unknown;
  cell?: (props: { row: T; value: unknown }) => ReactNode;
  headerCell?: (props: { column: Column<T> }) => ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * The minimum a row has to look like.
 *
 * Deliberately just an optional `id`, with no `[key: string]: unknown`. An index
 * signature here would mean no ordinary interface satisfies the constraint —
 * `interface User { id: number; name: string }` is not assignable to a type with an
 * index signature — so `Table<T>` would silently fall back to this default and every
 * cell value would arrive as `unknown`. Callers would have had to add
 * `[key: string]: unknown` to their own domain types, giving up the type safety the
 * table is supposed to provide.
 *
 * Columns addressed by string `key` are read through a cast internally instead. Rows
 * with no `id` are fine — pass `getRowId` to say what identifies them.
 */
export interface TableRow {
  id?: string | number;
}

export interface UseTableOptions<T = TableRow> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: { pageSize: number } | false;
  selectable?: boolean;
  multiSelect?: boolean;
  expandable?: boolean;
  getRowId?: (row: T, index: number) => string | number;
  initialSort?: SortState;
  initialFilters?: FilterState;
  initialPage?: number;
  stickyHeader?: boolean;
}

export interface UseTableReturn<T = TableRow> {
  // Data
  rows: T[];
  originalData: T[];
  
  // Headers
  headers: Column<T>[];
  
  // Sorting
  sortBy: SortState;
  setSortBy: (sort: SortState) => void;
  toggleSort: (key: string) => void;
  
  // Filtering
  filters: FilterState;
  setFilter: (key: string, value: string) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  
  // Pagination
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Selection
  selectedRows: (string | number)[];
  selectedRowIds: Set<string | number>;
  toggleRowSelection: (id: string | number) => void;
  selectRow: (id: string | number) => void;
  deselectRow: (id: string | number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: string | number) => boolean;
  
  // Expansion
  expandedRows: (string | number)[];
  expandedRowIds: Set<string | number>;
  toggleRowExpansion: (id: string | number) => void;
  expandRow: (id: string | number) => void;
  collapseRow: (id: string | number) => void;
  collapseAll: () => void;
  isExpanded: (id: string | number) => boolean;
  
  // Column resizing
  columnWidths: Record<string, number>;
  setColumnWidth: (key: string, width: number) => void;
  
  // State
  isFiltered: boolean;
  isSorted: boolean;
}

export interface TableProps<T = TableRow> extends UseTableOptions<T> {
  className?: string;
  style?: CSSProperties;
  tableClassName?: string;
  tableStyle?: CSSProperties;
  headerClassName?: string;
  headerStyle?: CSSProperties;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  rowClassName?: string | ((row: T) => string);
  rowStyle?: CSSProperties | ((row: T) => CSSProperties);
  cellClassName?: string;
  cellStyle?: CSSProperties;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingComponent?: ReactNode;
  renderExpandedRow?: (row: T) => ReactNode;
  virtualized?: boolean;
  rowHeight?: number;
  overscan?: number;
  maxHeight?: number | string;
}

export interface TableHeaderProps<T = TableRow> {
  columns: Column<T>[];
  sortBy: SortState;
  filters: FilterState;
  columnWidths: Record<string, number>;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  sticky?: boolean;
  onSort: (key: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onResize: (key: string, width: number) => void;
  className?: string;
  style?: CSSProperties;
}

export interface TableBodyProps<T = TableRow> {
  rows: T[];
  columns: Column<T>[];
  columnWidths: Record<string, number>;
  selectedRowIds: Set<string | number>;
  expandedRowIds: Set<string | number>;
  selectable?: boolean;
  expandable?: boolean;
  multiSelect?: boolean;
  virtualized?: boolean;
  rowHeight?: number;
  overscan?: number;
  maxHeight?: number | string;
  onToggleSelection: (id: string | number) => void;
  onToggleExpansion: (id: string | number) => void;
  getRowId: (row: T, index: number) => string | number;
  renderExpandedRow?: (row: T) => ReactNode;
  rowClassName?: string | ((row: T) => string);
  rowStyle?: CSSProperties | ((row: T) => CSSProperties);
  cellClassName?: string;
  cellStyle?: CSSProperties;
  emptyMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface TablePaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  style?: CSSProperties;
  showPageSize?: boolean;
  showFirstLast?: boolean;
}

// @input-kit/table
// Data table with virtualization, sorting, and filtering

export { Table } from './Table';
export { useTable } from './useTable';
export { TableHeader } from './TableHeader';
export { TableBody } from './TableBody';
export { TablePagination } from './TablePagination';

// Utilities
export {
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  defaultGetRowId,
  clamp,
  parseWidth,
  debounce,
  getCellValue,
} from './utils';

// Types
export type {
  SortDirection,
  SortState,
  FilterState,
  PaginationState,
  Column,
  TableRow,
  UseTableOptions,
  UseTableReturn,
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TablePaginationProps,
} from './types';

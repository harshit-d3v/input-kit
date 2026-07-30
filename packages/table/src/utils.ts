import type { SortState, FilterState, Column, TableRow } from './types';

/**
 * Read a column's field off a row by string key.
 *
 * Columns are addressed by `key`, which is a string, but rows are the caller's own
 * types and rightly have no index signature. The cast is confined here so it is not
 * scattered through the table internals — see the note on {@link TableRow}.
 */
function readField(row: unknown, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

/**
 * Sort data based on sort state
 */
export function sortData<T extends TableRow>(
  data: T[],
  sortBy: SortState,
  columns: Column<T>[]
): T[] {
  if (!sortBy.key || !sortBy.direction) {
    return data;
  }

  const column = columns.find((col) => col.key === sortBy.key);
  if (!column) return data;

  return [...data].sort((a, b) => {
    let valueA: unknown;
    let valueB: unknown;

    if (column.accessor) {
      valueA = column.accessor(a);
      valueB = column.accessor(b);
    } else {
      valueA = readField(a, sortBy.key!);
      valueB = readField(b, sortBy.key!);
    }

    // Handle null/undefined
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortBy.direction === 'asc' ? -1 : 1;
    if (valueB == null) return sortBy.direction === 'asc' ? 1 : -1;

    // Compare values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const comparison = valueA.localeCompare(valueB);
      return sortBy.direction === 'asc' ? comparison : -comparison;
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortBy.direction === 'asc' ? valueA - valueB : valueB - valueA;
    }

    if (valueA instanceof Date && valueB instanceof Date) {
      const comparison = valueA.getTime() - valueB.getTime();
      return sortBy.direction === 'asc' ? comparison : -comparison;
    }

    // Default string comparison
    const strA = String(valueA);
    const strB = String(valueB);
    const comparison = strA.localeCompare(strB);
    return sortBy.direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter data based on filter state
 */
export function filterData<T extends TableRow>(
  data: T[],
  filters: FilterState,
  columns: Column<T>[]
): T[] {
  const activeFilters = Object.entries(filters).filter(([, value]) => value.trim() !== '');
  
  if (activeFilters.length === 0) {
    return data;
  }

  return data.filter((row) => {
    return activeFilters.every(([key, filterValue]) => {
      const column = columns.find((col) => col.key === key);
      if (!column) return true;

      let value: unknown;
      if (column.accessor) {
        value = column.accessor(row);
      } else {
        value = readField(row, key);
      }

      if (value == null) return false;

      const strValue = String(value).toLowerCase();
      const strFilter = filterValue.toLowerCase();

      return strValue.includes(strFilter);
    });
  });
}

/**
 * Paginate data
 */
export function paginateData<T extends TableRow>(
  data: T[],
  page: number,
  pageSize: number
): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
}

/**
 * Calculate pagination state
 */
export function calculatePagination(
  total: number,
  page: number,
  pageSize: number
): {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
} {
  const totalPages = Math.ceil(total / pageSize);
  const clampedPage = Math.max(1, Math.min(page, totalPages || 1));

  return {
    page: clampedPage,
    pageSize,
    total,
    totalPages,
  };
}

/**
 * Get default row ID
 */
export function defaultGetRowId<T extends TableRow>(
  row: T,
  index: number
): string | number {
  if (row.id != null) {
    return row.id;
  }
  return index;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Parse CSS width value to number
 */
export function parseWidth(width: number | string | undefined): number | undefined {
  if (width == null) return undefined;
  if (typeof width === 'number') return width;
  
  const parsed = parseFloat(width);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Get cell value from row
 */
export function getCellValue<T extends TableRow>(
  row: T,
  column: Column<T>
): unknown {
  if (column.accessor) {
    return column.accessor(row);
  }
  return readField(row, column.key);
}

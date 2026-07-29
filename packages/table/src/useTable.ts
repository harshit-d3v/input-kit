import { useState, useMemo, useCallback, useRef } from 'react';
import type {
  UseTableOptions,
  UseTableReturn,
  SortState,
  FilterState,
  PaginationState,
  TableRow,
} from './types';
import {
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  defaultGetRowId,
  clamp,
} from './utils';

export function useTable<T extends TableRow = TableRow>(
  options: UseTableOptions<T>
): UseTableReturn<T> {
  const {
    data,
    columns,
    sortable = false,
    filterable = false,
    pagination: paginationConfig = false,
    selectable = false,
    multiSelect = false,
    expandable = false,
    getRowId = defaultGetRowId,
    initialSort = { key: null, direction: null },
    initialFilters = {},
    initialPage = 1,
  } = options;

  // Sort state
  const [sortBy, setSortBy] = useState<SortState>(initialSort);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Pagination state
  const pageSize = paginationConfig ? paginationConfig.pageSize : data.length;
  const [paginationState, setPaginationState] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: initialPage,
    pageSize,
  });

  // Selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set()
  );

  // Expansion state
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string | number>>(
    new Set()
  );

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Process data: filter -> sort -> paginate
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filterable) {
      result = filterData(result, filters, columns);
    }

    // Apply sorting
    if (sortable) {
      result = sortData(result, sortBy, columns);
    }

    return result;
  }, [data, filters, sortBy, columns, filterable, sortable]);

  // Track processed data length for stable pagination callbacks
  const processedDataLengthRef = useRef(0);
  processedDataLengthRef.current = processedData.length;

  // Calculate pagination
  const pagination: PaginationState = useMemo(() => {
    const total = processedData.length;
    return calculatePagination(
      total,
      paginationState.page,
      paginationState.pageSize
    );
  }, [processedData.length, paginationState.page, paginationState.pageSize]);

  // Get paginated rows
  const rows = useMemo(() => {
    if (paginationConfig === false) {
      return processedData;
    }
    return paginateData(
      processedData,
      pagination.page,
      pagination.pageSize
    );
  }, [processedData, pagination, paginationConfig]);

  // Sort handlers
  const toggleSort = useCallback((key: string) => {
    setSortBy((current) => {
      if (current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  }, []);

  // Filter handlers
  const setFilter = useCallback((key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    // Reset to first page when filtering
    setPaginationState((current) => ({ ...current, page: 1 }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters((current) => {
      const { [key]: _, ...rest } = current;
      return rest;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setPaginationState((current) => ({
      ...current,
      page: clamp(page, 1, Math.ceil(processedDataLengthRef.current / current.pageSize) || 1),
    }));
  }, []);

  const setPageSize = useCallback((newPageSize: number) => {
    setPaginationState((current) => {
      const newTotalPages = Math.ceil(processedDataLengthRef.current / newPageSize) || 1;
      return {
        page: clamp(current.page, 1, newTotalPages),
        pageSize: newPageSize,
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setPaginationState((current) => ({
      ...current,
      page: clamp(current.page + 1, 1, pagination.totalPages),
    }));
  }, [pagination.totalPages]);

  const prevPage = useCallback(() => {
    setPaginationState((current) => ({
      ...current,
      page: clamp(current.page - 1, 1, pagination.totalPages),
    }));
  }, [pagination.totalPages]);

  const goToFirstPage = useCallback(() => {
    setPaginationState((current) => ({ ...current, page: 1 }));
  }, []);

  const goToLastPage = useCallback(() => {
    setPaginationState((current) => ({
      ...current,
      page: pagination.totalPages,
    }));
  }, [pagination.totalPages]);

  // Selection handlers
  const toggleRowSelection = useCallback((id: string | number) => {
    if (!selectable) return;

    setSelectedRowIds((current) => {
      const newSet = multiSelect ? new Set(current) : new Set<string | number>();
      if (current.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [selectable, multiSelect]);

  const selectRow = useCallback((id: string | number) => {
    if (!selectable) return;

    setSelectedRowIds((current) => {
      const newSet = multiSelect ? new Set(current) : new Set<string | number>();
      newSet.add(id);
      return newSet;
    });
  }, [selectable, multiSelect]);

  const deselectRow = useCallback((id: string | number) => {
    if (!selectable) return;

    setSelectedRowIds((current) => {
      const newSet = new Set(current);
      newSet.delete(id);
      return newSet;
    });
  }, [selectable]);

  const selectAll = useCallback(() => {
    if (!selectable) return;

    const allIds = rows.map((row, index) => getRowId(row, index));
    setSelectedRowIds(new Set(allIds));
  }, [selectable, rows, getRowId]);

  const deselectAll = useCallback(() => {
    if (!selectable) return;

    setSelectedRowIds(new Set());
  }, [selectable]);

  const isSelected = useCallback((id: string | number) => {
    return selectedRowIds.has(id);
  }, [selectedRowIds]);

  // Expansion handlers
  const toggleRowExpansion = useCallback((id: string | number) => {
    if (!expandable) return;

    setExpandedRowIds((current) => {
      const newSet = new Set(current);
      if (current.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [expandable]);

  const expandRow = useCallback((id: string | number) => {
    if (!expandable) return;

    setExpandedRowIds((current) => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  }, [expandable]);

  const collapseRow = useCallback((id: string | number) => {
    if (!expandable) return;

    setExpandedRowIds((current) => {
      const newSet = new Set(current);
      newSet.delete(id);
      return newSet;
    });
  }, [expandable]);

  const collapseAll = useCallback(() => {
    if (!expandable) return;

    setExpandedRowIds(new Set());
  }, [expandable]);

  const isExpanded = useCallback((id: string | number) => {
    return expandedRowIds.has(id);
  }, [expandedRowIds]);

  // Column resize handler
  const setColumnWidth = useCallback((key: string, width: number) => {
    setColumnWidths((current) => ({ ...current, [key]: width }));
  }, []);

  // Computed values
  const isFiltered = Object.values(filters).some((v) => v.trim() !== '');
  const isSorted = sortBy.key !== null && sortBy.direction !== null;

  return {
    // Data
    rows,
    originalData: data,

    // Headers
    headers: columns,

    // Sorting
    sortBy,
    setSortBy,
    toggleSort,

    // Filtering
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,

    // Pagination
    pagination,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,

    // Selection
    selectedRows: Array.from(selectedRowIds),
    selectedRowIds,
    toggleRowSelection,
    selectRow,
    deselectRow,
    selectAll,
    deselectAll,
    isSelected,

    // Expansion
    expandedRows: Array.from(expandedRowIds),
    expandedRowIds,
    toggleRowExpansion,
    expandRow,
    collapseRow,
    collapseAll,
    isExpanded,

    // Column resizing
    columnWidths,
    setColumnWidth,

    // State
    isFiltered,
    isSorted,
  };
}

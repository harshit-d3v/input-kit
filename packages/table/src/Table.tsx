import { useMemo } from 'react';
import type { TableProps, TableRow } from './types';
import { useTable } from './useTable';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TablePagination } from './TablePagination';
import { defaultGetRowId } from './utils';

export function Table<T extends TableRow = TableRow>({
  // Data
  data,
  columns,

  // Features
  sortable = false,
  filterable = false,
  pagination: paginationConfig = false,
  selectable = false,
  multiSelect = false,
  expandable = false,
  virtualized = false,
  stickyHeader = false,

  // Styling
  className,
  style,
  tableClassName,
  tableStyle,
  headerClassName,
  headerStyle,
  bodyClassName,
  bodyStyle,
  rowClassName,
  rowStyle,
  cellClassName,
  cellStyle,

  // Content
  emptyMessage,
  loading = false,
  loadingComponent,
  renderExpandedRow,

  // Virtualization
  rowHeight = 48,
  overscan = 5,
  maxHeight = 400,

  // Initial state
  initialSort,
  initialFilters,
  initialPage,
  getRowId,
}: TableProps<T>) {
  const table = useTable<T>({
    data,
    columns,
    sortable,
    filterable,
    pagination: paginationConfig,
    selectable,
    multiSelect,
    expandable,
    getRowId,
    initialSort,
    initialFilters,
    initialPage,
    stickyHeader,
  });

  const {
    rows,
    headers,
    sortBy,
    filters,
    pagination,
    selectedRowIds,
    expandedRowIds,
    columnWidths,
    toggleSort,
    setFilter,
    setPage,
    setPageSize,
    toggleRowSelection,
    toggleRowExpansion,
  } = table;

  const resolvedGetRowId = useMemo(
    () => getRowId || defaultGetRowId,
    [getRowId]
  );

  const showPagination = paginationConfig !== false && pagination.totalPages > 1;

  if (loading) {
    return (
      <div className={`table-container loading ${className || ''}`} style={style}>
        {loadingComponent || (
          <div className="table-loading">Loading...</div>
        )}
      </div>
    );
  }

  return (
    <div className={`table-container ${className || ''}`} style={style}>
      <table
        className={`table ${virtualized ? 'virtualized' : ''} ${tableClassName || ''}`}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          ...tableStyle,
        }}
      >
        <TableHeader
          columns={headers}
          sortBy={sortBy}
          filters={filters}
          columnWidths={columnWidths}
          sortable={sortable}
          filterable={filterable}
          resizable={columns.some((col) => col.resizable)}
          sticky={stickyHeader}
          onSort={toggleSort}
          onFilterChange={setFilter}
          onResize={table.setColumnWidth}
          className={headerClassName}
          style={headerStyle}
        />
        <TableBody
          rows={rows}
          columns={headers}
          columnWidths={columnWidths}
          selectedRowIds={selectedRowIds}
          expandedRowIds={expandedRowIds}
          selectable={selectable}
          expandable={expandable}
          multiSelect={multiSelect}
          virtualized={virtualized}
          rowHeight={rowHeight}
          overscan={overscan}
          maxHeight={maxHeight}
          onToggleSelection={toggleRowSelection}
          onToggleExpansion={toggleRowExpansion}
          getRowId={resolvedGetRowId}
          renderExpandedRow={renderExpandedRow}
          rowClassName={rowClassName}
          rowStyle={rowStyle}
          cellClassName={cellClassName}
          cellStyle={cellStyle}
          emptyMessage={emptyMessage}
          className={bodyClassName}
          style={bodyStyle}
        />
      </table>

      {showPagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}

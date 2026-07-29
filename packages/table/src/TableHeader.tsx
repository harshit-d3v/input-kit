import { useState, useRef, useCallback } from 'react';
import type { TableHeaderProps, Column } from './types';
import { parseWidth } from './utils';

export function TableHeader<T>({
  columns,
  sortBy,
  filters,
  columnWidths,
  sortable,
  filterable,
  resizable,
  sticky,
  onSort,
  onFilterChange,
  onResize,
  className,
  style,
}: TableHeaderProps<T>) {
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const handleSortClick = useCallback((column: Column<T>) => {
    if (sortable && column.sortable) {
      onSort(column.key);
    }
  }, [sortable, onSort]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    onFilterChange(key, value);
  }, [onFilterChange]);

  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    column: Column<T>
  ) => {
    if (!resizable || !column.resizable) return;

    e.preventDefault();
    e.stopPropagation();

    const key = column.key;
    const currentWidth = columnWidths[key] || parseWidth(column.width) || 150;

    setResizingColumn(key);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = currentWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const newWidth = Math.max(50, resizeStartWidth.current + delta);
      onResize(key, newWidth);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [resizable, columnWidths, onResize]);

  const getSortIndicator = (column: Column<T>) => {
    if (!sortable || !column.sortable) return null;
    if (sortBy.key !== column.key) {
      return <span className="table-sort-indicator">⇅</span>;
    }
    return (
      <span className="table-sort-indicator active">
        {sortBy.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <thead
      className={`table-header ${sticky ? 'table-header-sticky' : ''} ${className || ''}`}
      style={{
        ...(sticky && {
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }),
        ...style,
      }}
    >
      <tr className="table-header-row">
        {columns.map((column) => {
          const width = columnWidths[column.key] || column.width;
          const isResizing = resizingColumn === column.key;

          return (
            <th
              key={column.key}
              className={`table-header-cell ${column.sortable && sortable ? 'sortable' : ''} ${isResizing ? 'resizing' : ''} ${column.className || ''}`}
              style={{
                width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                position: 'relative',
                cursor: column.sortable && sortable ? 'pointer' : 'default',
                ...column.style,
              }}
              onClick={() => handleSortClick(column)}
            >
              <div className="table-header-content">
                {column.headerCell ? (
                  column.headerCell({ column })
                ) : (
                  <span className="table-header-title">{column.header}</span>
                )}
                {getSortIndicator(column)}
              </div>

              {filterable && column.filterable && (
                <div className="table-filter" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="table-filter-input"
                    placeholder="Filter..."
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  />
                </div>
              )}

              {resizable && column.resizable && (
                <div
                  className={`table-resize-handle ${isResizing ? 'active' : ''}`}
                  onMouseDown={(e) => handleResizeStart(e, column)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    cursor: 'col-resize',
                    backgroundColor: isResizing ? '#007bff' : 'transparent',
                  }}
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

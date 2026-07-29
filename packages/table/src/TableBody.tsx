import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { TableBodyProps, TableRow } from './types';
import { getCellValue, defaultGetRowId } from './utils';

// SVG Icon Components (Lucide-style)
const ChevronRightIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface VirtualItem {
  index: number;
  row: unknown;
}

export function TableBody<T extends TableRow = TableRow>({
  rows,
  columns,
  columnWidths,
  selectedRowIds,
  expandedRowIds,
  selectable,
  expandable,
  multiSelect,
  virtualized,
  rowHeight = 48,
  overscan = 5,
  maxHeight = 400,
  onToggleSelection,
  onToggleExpansion,
  getRowId = defaultGetRowId,
  renderExpandedRow,
  rowClassName,
  rowStyle,
  cellClassName,
  cellStyle,
  emptyMessage,
  className,
  style,
}: TableBodyProps<T>) {
  const containerRef = useRef<HTMLTableSectionElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range for virtualization
  const { virtualItems, topSpacerHeight, bottomSpacerHeight } = useMemo(() => {
    if (!virtualized) {
      return {
        virtualItems: [],
        totalHeight: 0,
        topSpacerHeight: 0,
        bottomSpacerHeight: 0,
      };
    }

    const totalHeight = rows.length * rowHeight;
    const viewportHeight = containerHeight || (typeof maxHeight === 'number' ? maxHeight : rowHeight * 6);
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
    const endIndex = Math.min(rows.length - 1, startIndex + visibleCount - 1);

    const virtualItems: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        row: rows[i],
      });
    }

    return {
      virtualItems,
      totalHeight,
      topSpacerHeight: startIndex * rowHeight,
      bottomSpacerHeight: Math.max(0, totalHeight - (endIndex + 1) * rowHeight),
    };
  }, [rows, virtualized, rowHeight, scrollTop, containerHeight, overscan, maxHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLTableSectionElement>) => {
    if (virtualized) {
      setScrollTop(e.currentTarget.scrollTop);
    }
  }, [virtualized]);

  // Update container height
  useEffect(() => {
    if (virtualized && containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
    return undefined;
  }, [virtualized]);

  // Render cell content
  const renderCell = (row: T, column: typeof columns[0]) => {
    const value = getCellValue(row, column);

    if (column.cell) {
      return column.cell({ row, value });
    }

    if (value == null) {
      return null;
    }

    return String(value);
  };

  // Render row
  const renderRow = (row: T, index: number) => {
    const id = getRowId(row, index);
    const isSelected = selectedRowIds.has(id);
    const isExpanded = expandedRowIds.has(id);

    const computedRowClassName =
      typeof rowClassName === 'function' ? rowClassName(row) : rowClassName;

    const computedRowStyle =
      typeof rowStyle === 'function' ? rowStyle(row) : rowStyle;

    const rowKey = String(id);

    return (
      <React.Fragment key={rowKey}>
        <tr
          className={`table-row ${isSelected ? 'selected' : ''} ${computedRowClassName || ''}`}
          style={{
            ...(virtualized
              ? {
                  display: 'table',
                  tableLayout: 'fixed',
                  width: '100%',
                  height: rowHeight,
                }
              : undefined),
            ...computedRowStyle,
          }}
          onClick={() => selectable && onToggleSelection(id)}
        >
          {selectable && (
            <td className="table-cell table-select-cell" style={cellStyle}>
              <input
                type={multiSelect ? 'checkbox' : 'radio'}
                checked={isSelected}
                onChange={() => onToggleSelection(id)}
                onClick={(e) => e.stopPropagation()}
              />
            </td>
          )}
          {expandable && (
            <td className="table-cell table-expand-cell" style={cellStyle}>
              <button
                className={`table-expand-button ${isExpanded ? 'expanded' : ''}`}
                aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpansion(id);
                }}
              >
                {isExpanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
              </button>
            </td>
          )}
          {columns.map((column) => {
            const width = columnWidths[column.key] || column.width;
            return (
              <td
                key={column.key}
                className={`table-cell ${cellClassName || ''} ${column.className || ''}`}
                style={{
                  width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                  ...cellStyle,
                  ...column.style,
                }}
              >
                {renderCell(row, column)}
              </td>
            );
          })}
        </tr>
        {expandable && isExpanded && renderExpandedRow && (
          <tr key={`${rowKey}-expanded`} className="table-row-expanded">
            <td
              colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
              className="table-cell-expanded"
              style={virtualized ? { display: 'table-cell' } : undefined}
            >
              {renderExpandedRow(row)}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  if (rows.length === 0) {
    return (
      <tbody className={`table-body empty ${className || ''}`} style={style}>
        <tr>
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
            className="table-empty-message"
          >
            {emptyMessage || 'No data available'}
          </td>
        </tr>
      </tbody>
    );
  }

  const tbodyContent = virtualized ? (
    <>
      {topSpacerHeight > 0 && (
        <tr aria-hidden="true">
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
            style={{ padding: 0, border: 0, height: topSpacerHeight }}
          />
        </tr>
      )}
      {virtualItems.map((item) => renderRow(rows[item.index], item.index))}
      {bottomSpacerHeight > 0 && (
        <tr aria-hidden="true">
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
            style={{ padding: 0, border: 0, height: bottomSpacerHeight }}
          />
        </tr>
      )}
    </>
  ) : (
    rows.map((row, index) => renderRow(row, index))
  );

  return (
    <tbody
      ref={containerRef}
      className={`table-body ${className || ''}`}
      style={{
        ...(virtualized
          ? {
              display: 'block',
              maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
              overflow: 'auto',
              width: '100%',
            }
          : undefined),
        ...style,
      }}
      onScroll={virtualized ? handleScroll : undefined}
    >
      {tbodyContent}
    </tbody>
  );
}

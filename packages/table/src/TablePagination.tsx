import { useMemo, useCallback } from 'react';
import type { TablePaginationProps } from './types';

export function TablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  style,
  showPageSize = true,
  showFirstLast = true,
}: TablePaginationProps) {
  const { page, pageSize, total, totalPages } = pagination;

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust if at the beginning
      if (page <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      // Adjust if at the end
      else if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages]);

  const handlePageClick = useCallback((pageNum: number | string) => {
    if (typeof pageNum === 'number' && pageNum !== page) {
      onPageChange(pageNum);
    }
  }, [page, onPageChange]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    onPageSizeChange?.(newPageSize);
  }, [onPageSizeChange]);

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  if (totalPages <= 1 && !showPageSize) {
    return null;
  }

  return (
    <div className={`table-pagination ${className || ''}`} style={style}>
      <div className="table-pagination-info">
        Showing {startItem} to {endItem} of {total} entries
      </div>

      <div className="table-pagination-controls">
        {showFirstLast && (
          <button
            className="table-pagination-button"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            {'<<'}
          </button>
        )}

        <button
          className="table-pagination-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          {'<'}
        </button>

        {pageNumbers.map((pageNum, index) => (
          <button
            key={index}
            className={`table-pagination-button ${pageNum === page ? 'active' : ''} ${typeof pageNum === 'string' ? 'ellipsis' : ''}`}
            onClick={() => handlePageClick(pageNum)}
            disabled={typeof pageNum === 'string'}
            aria-label={typeof pageNum === 'number' ? `Page ${pageNum}` : undefined}
            aria-current={pageNum === page ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        <button
          className="table-pagination-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          aria-label="Next page"
        >
          {'>'}
        </button>

        {showFirstLast && (
          <button
            className="table-pagination-button"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || totalPages === 0}
            aria-label="Last page"
          >
            {'>>'}
          </button>
        )}
      </div>

      {showPageSize && onPageSizeChange && (
        <div className="table-pagination-size">
          <label>
            Show:
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="table-pagination-select"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            entries
          </label>
        </div>
      )}
    </div>
  );
}

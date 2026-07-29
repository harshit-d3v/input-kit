import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTable } from './useTable';
import type { Column, TableRow } from './types';

interface TestRow extends TableRow {
  id: number;
  name: string;
  age: number;
}

const testData: TestRow[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
  { id: 4, name: 'David', age: 28 },
];

const columns: Column<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
];

describe('useTable', () => {
  describe('basic functionality', () => {
    it('should return rows', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns })
      );
      expect(result.current.rows).toEqual(testData);
    });

    it('should return original data', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns })
      );
      expect(result.current.originalData).toEqual(testData);
    });

    it('should return headers', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns })
      );
      expect(result.current.headers).toEqual(columns);
    });
  });

  describe('sorting', () => {
    it('should toggle sort on column', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, sortable: true })
      );

      act(() => {
        result.current.toggleSort('name');
      });

      expect(result.current.sortBy).toEqual({ key: 'name', direction: 'asc' });
      expect(result.current.rows[0].name).toBe('Alice');
    });

    it('should toggle sort direction', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, sortable: true })
      );

      act(() => {
        result.current.toggleSort('name');
        result.current.toggleSort('name');
      });

      expect(result.current.sortBy).toEqual({ key: 'name', direction: 'desc' });
      expect(result.current.rows[0].name).toBe('David');
    });

    it('should clear sort on third toggle', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, sortable: true })
      );

      act(() => {
        result.current.toggleSort('name');
        result.current.toggleSort('name');
        result.current.toggleSort('name');
      });

      expect(result.current.sortBy).toEqual({ key: null, direction: null });
    });

    it('should set sort directly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, sortable: true })
      );

      act(() => {
        result.current.setSortBy({ key: 'age', direction: 'desc' });
      });

      expect(result.current.sortBy).toEqual({ key: 'age', direction: 'desc' });
      expect(result.current.rows[0].age).toBe(35);
    });

    it('should report isSorted correctly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, sortable: true })
      );

      expect(result.current.isSorted).toBe(false);

      act(() => {
        result.current.toggleSort('name');
      });

      expect(result.current.isSorted).toBe(true);
    });
  });

  describe('filtering', () => {
    it('should filter rows', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, filterable: true })
      );

      act(() => {
        result.current.setFilter('name', 'li');
      });

      expect(result.current.rows).toHaveLength(2);
      expect(result.current.filters).toEqual({ name: 'li' });
    });

    it('should clear filter', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, filterable: true })
      );

      act(() => {
        result.current.setFilter('name', 'li');
        result.current.clearFilter('name');
      });

      expect(result.current.rows).toHaveLength(4);
      expect(result.current.filters).toEqual({});
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, filterable: true })
      );

      act(() => {
        result.current.setFilter('name', 'li');
        result.current.setFilter('age', '3');
        result.current.clearAllFilters();
      });

      expect(result.current.rows).toHaveLength(4);
      expect(result.current.filters).toEqual({});
    });

    it('should report isFiltered correctly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, filterable: true })
      );

      expect(result.current.isFiltered).toBe(false);

      act(() => {
        result.current.setFilter('name', 'li');
      });

      expect(result.current.isFiltered).toBe(true);
    });
  });

  describe('pagination', () => {
    it('should paginate rows', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 2 },
        })
      );

      expect(result.current.rows).toHaveLength(2);
      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.totalPages).toBe(2);
    });

    it('should change page', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 2 },
        })
      );

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.pagination.page).toBe(2);
      expect(result.current.rows[0].id).toBe(3);
    });

    it('should go to next page', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 2 },
        })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.pagination.page).toBe(2);
    });

    it('should go to previous page', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 2 },
        })
      );

      act(() => {
        result.current.setPage(2);
        result.current.prevPage();
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should go to first page', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 1 },
        })
      );

      act(() => {
        result.current.setPage(4);
        result.current.goToFirstPage();
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should go to last page', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 2 },
        })
      );

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.pagination.page).toBe(2);
    });

    it('should change page size', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          pagination: { pageSize: 2 },
        })
      );

      act(() => {
        result.current.setPageSize(4);
      });

      expect(result.current.pagination.pageSize).toBe(4);
      expect(result.current.rows).toHaveLength(4);
    });

    it('should reset to page 1 when filtering', () => {
      const { result } = renderHook(() =>
        useTable({
          data: testData,
          columns,
          filterable: true,
          pagination: { pageSize: 1 },
        })
      );

      act(() => {
        result.current.setPage(4);
        result.current.setFilter('name', 'li');
      });

      expect(result.current.pagination.page).toBe(1);
    });
  });

  describe('selection', () => {
    it('should toggle row selection', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true })
      );

      act(() => {
        result.current.toggleRowSelection(1);
      });

      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.selectedRows).toContain(1);
    });

    it('should deselect row on second toggle', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true })
      );

      act(() => {
        result.current.toggleRowSelection(1);
        result.current.toggleRowSelection(1);
      });

      expect(result.current.isSelected(1)).toBe(false);
    });

    it('should select row directly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true })
      );

      act(() => {
        result.current.selectRow(1);
      });

      expect(result.current.isSelected(1)).toBe(true);
    });

    it('should deselect row directly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true })
      );

      act(() => {
        result.current.selectRow(1);
        result.current.deselectRow(1);
      });

      expect(result.current.isSelected(1)).toBe(false);
    });

    it('should select all rows', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedRows).toHaveLength(4);
    });

    it('should deselect all rows', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true })
      );

      act(() => {
        result.current.selectAll();
        result.current.deselectAll();
      });

      expect(result.current.selectedRows).toHaveLength(0);
    });

    it('should only allow single selection when multiSelect is false', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, selectable: true, multiSelect: false })
      );

      act(() => {
        result.current.toggleRowSelection(1);
        result.current.toggleRowSelection(2);
      });

      expect(result.current.selectedRows).toHaveLength(1);
      expect(result.current.isSelected(1)).toBe(false);
      expect(result.current.isSelected(2)).toBe(true);
    });
  });

  describe('expansion', () => {
    it('should toggle row expansion', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, expandable: true })
      );

      act(() => {
        result.current.toggleRowExpansion(1);
      });

      expect(result.current.isExpanded(1)).toBe(true);
      expect(result.current.expandedRows).toContain(1);
    });

    it('should collapse row on second toggle', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, expandable: true })
      );

      act(() => {
        result.current.toggleRowExpansion(1);
        result.current.toggleRowExpansion(1);
      });

      expect(result.current.isExpanded(1)).toBe(false);
    });

    it('should expand row directly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, expandable: true })
      );

      act(() => {
        result.current.expandRow(1);
      });

      expect(result.current.isExpanded(1)).toBe(true);
    });

    it('should collapse row directly', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, expandable: true })
      );

      act(() => {
        result.current.expandRow(1);
        result.current.collapseRow(1);
      });

      expect(result.current.isExpanded(1)).toBe(false);
    });

    it('should collapse all rows', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns, expandable: true })
      );

      act(() => {
        result.current.expandRow(1);
        result.current.expandRow(2);
        result.current.collapseAll();
      });

      expect(result.current.expandedRows).toHaveLength(0);
    });
  });

  describe('column resizing', () => {
    it('should set column width', () => {
      const { result } = renderHook(() =>
        useTable({ data: testData, columns })
      );

      act(() => {
        result.current.setColumnWidth('name', 200);
      });

      expect(result.current.columnWidths.name).toBe(200);
    });
  });
});

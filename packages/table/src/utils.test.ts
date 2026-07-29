import { describe, it, expect } from 'vitest';
import {
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  defaultGetRowId,
  clamp,
  parseWidth,
  getCellValue,
} from './utils';
import type { Column, SortState, TableRow } from './types';

interface TestRow extends TableRow {
  id: number;
  name: string;
  email: string;
  age: number;
  score: number | null;
}

const testData: TestRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30, score: 85 },
  { id: 2, name: 'Bob', email: 'bob@test.com', age: 25, score: 92 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35, score: null },
  { id: 4, name: 'David', email: 'david@test.com', age: 28, score: 78 },
];

const columns: Column<TestRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'age', header: 'Age' },
  { key: 'score', header: 'Score' },
];

describe('sortData', () => {
  it('should return data unchanged when no sort is applied', () => {
    const sortBy: SortState = { key: null, direction: null };
    const result = sortData(testData, sortBy, columns);
    expect(result).toEqual(testData);
  });

  it('should sort by string column ascending', () => {
    const sortBy: SortState = { key: 'name', direction: 'asc' };
    const result = sortData(testData, sortBy, columns);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie', 'David']);
  });

  it('should sort by string column descending', () => {
    const sortBy: SortState = { key: 'name', direction: 'desc' };
    const result = sortData(testData, sortBy, columns);
    expect(result.map((r) => r.name)).toEqual(['David', 'Charlie', 'Bob', 'Alice']);
  });

  it('should sort by number column ascending', () => {
    const sortBy: SortState = { key: 'age', direction: 'asc' };
    const result = sortData(testData, sortBy, columns);
    expect(result.map((r) => r.age)).toEqual([25, 28, 30, 35]);
  });

  it('should sort by number column descending', () => {
    const sortBy: SortState = { key: 'age', direction: 'desc' };
    const result = sortData(testData, sortBy, columns);
    expect(result.map((r) => r.age)).toEqual([35, 30, 28, 25]);
  });

  it('should handle null values when sorting', () => {
    const sortBy: SortState = { key: 'score', direction: 'asc' };
    const result = sortData(testData, sortBy, columns);
    expect(result[0].score).toBeNull();
  });

  it('should use accessor function when provided', () => {
    const columnsWithAccessor: Column<TestRow>[] = [
      { key: 'name', header: 'Name', accessor: (row) => row.name.toLowerCase() },
    ];
    const sortBy: SortState = { key: 'name', direction: 'asc' };
    const result = sortData(testData, sortBy, columnsWithAccessor);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie', 'David']);
  });
});

describe('filterData', () => {
  it('should return all data when no filters are applied', () => {
    const filters = {};
    const result = filterData(testData, filters, columns);
    expect(result).toHaveLength(4);
  });

  it('should filter by string value', () => {
    const filters = { name: 'li' };
    const result = filterData(testData, filters, columns);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toContain('Alice');
    expect(result.map((r) => r.name)).toContain('Charlie');
  });

  it('should filter case-insensitively', () => {
    const filters = { email: 'EXAMPLE' };
    const result = filterData(testData, filters, columns);
    expect(result).toHaveLength(2);
  });

  it('should filter by multiple columns', () => {
    const filters = { name: 'a', email: 'test' };
    const result = filterData(testData, filters, columns);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('David');
  });

  it('should return empty array when no matches found', () => {
    const filters = { name: 'xyz' };
    const result = filterData(testData, filters, columns);
    expect(result).toHaveLength(0);
  });

  it('should use accessor function when provided', () => {
    const columnsWithAccessor: Column<TestRow>[] = [
      { key: 'name', header: 'Name', accessor: (row) => row.name.toUpperCase() },
    ];
    const filters = { name: 'ALICE' };
    const result = filterData(testData, filters, columnsWithAccessor);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });
});

describe('paginateData', () => {
  it('should return first page correctly', () => {
    const result = paginateData(testData, 1, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('should return second page correctly', () => {
    const result = paginateData(testData, 2, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(3);
    expect(result[1].id).toBe(4);
  });

  it('should handle partial last page', () => {
    const result = paginateData(testData, 2, 3);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('should return empty array for out of bounds page', () => {
    const result = paginateData(testData, 10, 2);
    expect(result).toHaveLength(0);
  });
});

describe('calculatePagination', () => {
  it('should calculate pagination correctly', () => {
    const result = calculatePagination(100, 1, 10);
    expect(result).toEqual({
      page: 1,
      pageSize: 10,
      total: 100,
      totalPages: 10,
    });
  });

  it('should clamp page to valid range', () => {
    const result = calculatePagination(100, 15, 10);
    expect(result.page).toBe(10);
  });

  it('should handle zero total items', () => {
    const result = calculatePagination(0, 1, 10);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });

  it('should calculate total pages correctly', () => {
    expect(calculatePagination(95, 1, 10).totalPages).toBe(10);
    expect(calculatePagination(100, 1, 10).totalPages).toBe(10);
    expect(calculatePagination(101, 1, 10).totalPages).toBe(11);
  });
});

describe('defaultGetRowId', () => {
  it('should return row.id when available', () => {
    const row = { id: 123, name: 'Test' };
    expect(defaultGetRowId(row, 0)).toBe(123);
  });

  it('should return index when row.id is not available', () => {
    const row = { name: 'Test' };
    expect(defaultGetRowId(row, 5)).toBe(5);
  });
});

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should return min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should return max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('parseWidth', () => {
  it('should return number as-is', () => {
    expect(parseWidth(100)).toBe(100);
  });

  it('should parse pixel string', () => {
    expect(parseWidth('150px')).toBe(150);
  });

  it('should parse percentage string', () => {
    expect(parseWidth('50%')).toBe(50);
  });

  it('should return undefined for undefined input', () => {
    expect(parseWidth(undefined)).toBeUndefined();
  });

  it('should return undefined for invalid string', () => {
    expect(parseWidth('auto')).toBeUndefined();
  });
});

describe('getCellValue', () => {
  it('should return value from row by key', () => {
    const column: Column<TestRow> = { key: 'name', header: 'Name' };
    expect(getCellValue(testData[0], column)).toBe('Alice');
  });

  it('should use accessor function when provided', () => {
    const column: Column<TestRow> = {
      key: 'name',
      header: 'Name',
      accessor: (row) => row.name.toUpperCase(),
    };
    expect(getCellValue(testData[0], column)).toBe('ALICE');
  });
});

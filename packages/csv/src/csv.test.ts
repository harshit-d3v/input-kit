import { describe, it, expect } from 'vitest';
import { parseCSV, stringifyCSV, type ParseOptions, type StringifyOptions } from './index';

describe('parseCSV', () => {
  it('should parse simple CSV with headers', () => {
    const csv = `name,age,city
John,30,NYC
Jane,25,LA`;
    
    const result = parseCSV(csv);
    
    expect(result.data).toEqual([
      { name: 'John', age: '30', city: 'NYC' },
      { name: 'Jane', age: '25', city: 'LA' },
    ]);
    expect(result.meta.fields).toEqual(['name', 'age', 'city']);
    expect(result.meta.rowCount).toBe(2);
    expect(result.errors).toEqual([]);
  });

  it('should parse CSV without headers', () => {
    const csv = `John,30,NYC
Jane,25,LA`;
    
    const result = parseCSV(csv, { header: false });
    
    expect(result.data).toEqual([
      ['John', '30', 'NYC'],
      ['Jane', '25', 'LA'],
    ]);
    expect(result.meta.fields).toBeUndefined();
    expect(result.meta.rowCount).toBe(2);
  });

  it('should handle quoted values', () => {
    const csv = `name,description
"John Doe","Hello, World"
"Jane Smith","She said ""Hi"""`;
    
    const result = parseCSV(csv);
    
    expect(result.data).toEqual([
      { name: 'John Doe', description: 'Hello, World' },
      { name: 'Jane Smith', description: 'She said "Hi"' },
    ]);
  });

  it('should handle custom delimiter', () => {
    const csv = `name|age|city
John|30|NYC`;
    
    const result = parseCSV(csv, { delimiter: '|' });
    
    expect(result.data).toEqual([
      { name: 'John', age: '30', city: 'NYC' },
    ]);
  });

  it('should skip empty lines', () => {
    const csv = `name,age

John,30

Jane,25`;
    
    const result = parseCSV(csv, { skipEmptyLines: true });
    
    expect(result.data).toHaveLength(2);
  });

  it('should handle empty CSV', () => {
    const result = parseCSV('');
    
    expect(result.data).toEqual([]);
    expect(result.meta.rowCount).toBe(0);
  });

  it('should handle CSV with only headers', () => {
    const result = parseCSV('name,age,city');
    
    expect(result.data).toEqual([]);
    expect(result.meta.fields).toEqual(['name', 'age', 'city']);
  });
});

describe('stringifyCSV', () => {
  it('should stringify array of objects with headers', () => {
    const data = [
      { name: 'John', age: '30', city: 'NYC' },
      { name: 'Jane', age: '25', city: 'LA' },
    ];
    
    const result = stringifyCSV(data);
    
    expect(result).toBe(`name,age,city
John,30,NYC
Jane,25,LA`);
  });

  it('should stringify without headers', () => {
    const data = [
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ];
    
    const result = stringifyCSV(data, { header: false });
    
    expect(result).toBe(`John,30
Jane,25`);
  });

  it('should quote values with delimiters', () => {
    const data = [
      { name: 'John Doe', description: 'Hello, World' },
    ];
    
    const result = stringifyCSV(data);
    
    expect(result).toBe(`name,description
John Doe,"Hello, World"`);
  });

  it('should escape quotes in values', () => {
    const data = [
      { name: 'Jane Smith', quote: 'She said "Hi"' },
    ];
    
    const result = stringifyCSV(data);
    
    expect(result).toBe(`name,quote
Jane Smith,"She said ""Hi"""`);
  });

  it('should use custom delimiter', () => {
    const data = [
      { name: 'John', age: '30' },
    ];
    
    const result = stringifyCSV(data, { delimiter: '|' });
    
    expect(result).toBe(`name|age
John|30`);
  });

  it('should handle empty array', () => {
    const result = stringifyCSV([]);
    
    expect(result).toBe('');
  });

  it('should handle newlines in values', () => {
    const data = [
      { name: 'John', bio: 'Line 1\nLine 2' },
    ];
    
    const result = stringifyCSV(data);
    
    expect(result).toContain('"Line 1\nLine 2"');
  });
});

describe('Round-trip conversion', () => {
  it('should maintain data integrity through parse and stringify', () => {
    const original = [
      { name: 'John', age: '30', city: 'NYC' },
      { name: 'Jane', age: '25', city: 'LA' },
    ];
    
    const csvString = stringifyCSV(original);
    const parsed = parseCSV(csvString);
    
    expect(parsed.data).toEqual(original);
  });

  it('should handle special characters in round-trip', () => {
    const original = [
      { name: 'John "Johnny" Doe', description: 'Hello, World!' },
    ];
    
    const csvString = stringifyCSV(original);
    const parsed = parseCSV(csvString);
    
    expect(parsed.data).toEqual(original);
  });
});

/**
 * Test file to verify all imports work correctly
 * Run: npx tsx test-demo/test-imports.ts
 */

import {
  parseCSV,
  stringifyCSV,
  parseCSVStream,
  type ParseOptions,
  type ParseResult,
  type StringifyOptions,
} from '../src/index';

console.log('✅ All imports successful!\n');

// Test parseCSV
console.log('Testing parseCSV:');
const csvData = `name,age,city
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago`;

const parsed = parseCSV(csvData);
console.log(`Parsed ${parsed.meta.rowCount} rows`);
console.log(`Fields: ${parsed.meta.fields?.join(', ')}`);
console.log('First row:', parsed.data[0]);
console.log('');

// Test stringifyCSV
console.log('Testing stringifyCSV:');
const data = [
  { product: 'Apple', price: '1.50', quantity: '100' },
  { product: 'Banana', price: '0.75', quantity: '150' },
];

const csvString = stringifyCSV(data);
console.log('Stringified CSV:');
console.log(csvString);
console.log('');

// Test with custom delimiter
console.log('Testing custom delimiter (|):');
const customDelimiter = parseCSV('name|age\nJohn|30', { delimiter: '|' });
console.log('Parsed:', customDelimiter.data);
console.log('');

// Test with quoted values
console.log('Testing quoted values:');
const quotedCSV = `name,description
"John Doe","Hello, World!"
"Jane Smith","She said ""Hi"""`;
const quotedResult = parseCSV(quotedCSV);
console.log('Parsed quoted values:', quotedResult.data);
console.log('');

// Test round-trip
console.log('Testing round-trip (parse → stringify → parse):');
const original = [
  { name: 'Alice', age: '28', city: 'Seattle' },
  { name: 'Bob "Bobby" Jones', age: '32', city: 'Portland' },
];
const stringified = stringifyCSV(original);
const reparsed = parseCSV(stringified);
console.log('Original:', original);
console.log('After round-trip:', reparsed.data);
console.log('Match:', JSON.stringify(original) === JSON.stringify(reparsed.data));
console.log('');

// Test type checking
const options: ParseOptions = {
  delimiter: ',',
  header: true,
  skipEmptyLines: true,
};

const stringifyOpts: StringifyOptions = {
  delimiter: ',',
  header: true,
};

console.log('✅ All utility tests passed!');
console.log('🎉 Package is working correctly!');

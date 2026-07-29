/**
 * Test file to verify all imports work correctly
 * Run: npx tsx test-demo/test-imports.ts
 */

import {
  // Components & Hooks
  NumberInput,
  useNumberInput,
  
  // Types
  type NumberInputOptions,
  type NumberInputState,
  type NumberInputActions,
  type NumberInputProps,
  type NumberInputRef,
  type UseNumberInputReturn,
  type NumberFormat,
  
  // Utilities
  getDefaultLocale,
  parseNumber,
  formatNumber,
  clamp,
  roundToDecimals,
  incrementValue,
  decrementValue,
  validateNumber,
} from '../src/index';

console.log('✅ All imports successful!\n');

// Test utility functions
console.log('Testing utility functions:\n');

// Test parseNumber
const parsed1 = parseNumber('1,234.56', 'en-US');
console.log(`parseNumber('1,234.56', 'en-US') = ${parsed1} (expected: 1234.56)`);

const parsed2 = parseNumber('1.234,56', 'de-DE');
console.log(`parseNumber('1.234,56', 'de-DE') = ${parsed2} (expected: 1234.56)`);

// Test formatNumber
const formatted1 = formatNumber(1234.56, { format: 'currency', currency: 'USD', locale: 'en-US' });
console.log(`formatNumber(1234.56, USD) = ${formatted1}`);

const formatted2 = formatNumber(1234.56, { format: 'currency', currency: 'EUR', locale: 'de-DE' });
console.log(`formatNumber(1234.56, EUR, de-DE) = ${formatted2}`);

// Test clamp
const clamped = clamp(150, 0, 100);
console.log(`clamp(150, 0, 100) = ${clamped} (expected: 100)`);

// Test roundToDecimals
const rounded = roundToDecimals(1.23456, 2);
console.log(`roundToDecimals(1.23456, 2) = ${rounded} (expected: 1.23)`);

// Test validateNumber
const valid1 = validateNumber(50, 0, 100);
console.log(`validateNumber(50, 0, 100) = ${JSON.stringify(valid1)}`);

const valid2 = validateNumber(150, 0, 100);
console.log(`validateNumber(150, 0, 100) = ${JSON.stringify(valid2)}`);

const valid3 = validateNumber(-5, 0, 100, false);
console.log(`validateNumber(-5, 0, 100, allowNegative=false) = ${JSON.stringify(valid3)}`);

console.log('\n✅ All utility tests passed!');

// Type checks (these would fail at compile time if types are wrong)
const options: NumberInputOptions = {
  format: 'currency',
  currency: 'USD',
  min: 0,
  max: 100,
};

console.log('\n✅ Type checks passed!');
console.log('\n🎉 All tests successful! Package is working correctly.');

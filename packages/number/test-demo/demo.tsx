/**
 * Demo/Test file for @input-kit/number
 * 
 * This file demonstrates how to use the number input component
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState } from 'react';
import { NumberInput, useNumberInput } from '../src/index';

// Demo 1: Basic Number Input
function BasicExample() {
  const [value, setValue] = useState<number | null>(100);

  return (
    <div>
      <h3>Basic Number Input</h3>
      <NumberInput
        value={value}
        onChange={setValue}
        min={0}
        max={1000}
        step={10}
        placeholder="Enter a number"
      />
      <p>Value: {value}</p>
    </div>
  );
}

// Demo 2: Currency Input
function CurrencyExample() {
  const [value, setValue] = useState<number | null>(99.99);

  return (
    <div>
      <h3>Currency Input (USD)</h3>
      <NumberInput
        value={value}
        onChange={setValue}
        format="currency"
        currency="USD"
        min={0}
      />
      <p>Value: {value}</p>
    </div>
  );
}

// Demo 3: Percentage Input
function PercentageExample() {
  const [value, setValue] = useState<number | null>(0.15);

  return (
    <div>
      <h3>Percentage Input</h3>
      <NumberInput
        value={value}
        onChange={setValue}
        format="percent"
        decimals={1}
        min={0}
        max={1}
        step={0.01}
      />
      <p>Value: {value}</p>
    </div>
  );
}

// Demo 4: Using the Hook (Custom UI)
function HookExample() {
  const { inputProps, value, increment, decrement, clear, formattedValue } = useNumberInput({
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 5,
  });

  return (
    <div>
      <h3>Custom UI with Hook</h3>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={decrement}>-</button>
        <input {...inputProps} style={{ width: '100px', textAlign: 'center' }} />
        <button onClick={increment}>+</button>
        <button onClick={clear}>Clear</button>
      </div>
      <p>Raw Value: {value}</p>
      <p>Formatted: {formattedValue}</p>
    </div>
  );
}

// Demo 5: European Locale (German)
function GermanLocaleExample() {
  const [value, setValue] = useState<number | null>(1234.56);

  return (
    <div>
      <h3>German Locale (de-DE)</h3>
      <NumberInput
        value={value}
        onChange={setValue}
        locale="de-DE"
        format="currency"
        currency="EUR"
      />
      <p>Value: {value}</p>
    </div>
  );
}

// Demo 6: Validation States
function ValidationExample() {
  const [value, setValue] = useState<number | null>(null);

  return (
    <div>
      <h3>With Validation (required, min: 10, max: 100)</h3>
      <NumberInput
        value={value}
        onChange={setValue}
        min={10}
        max={100}
        allowEmpty={false}
        placeholder="Enter 10-100"
      />
      <p>Value: {value}</p>
      <p>Valid: {value !== null && value >= 10 && value <= 100 ? 'Yes' : 'No'}</p>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>@input-kit/number Demo</h1>
      
      <BasicExample />
      <hr />
      
      <CurrencyExample />
      <hr />
      
      <PercentageExample />
      <hr />
      
      <HookExample />
      <hr />
      
      <GermanLocaleExample />
      <hr />
      
      <ValidationExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, CurrencyExample, PercentageExample, HookExample, GermanLocaleExample, ValidationExample };

// Default export
export default DemoApp;

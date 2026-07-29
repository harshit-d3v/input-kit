/**
 * Demo/Test file for @input-kit/combobox
 * 
 * This file demonstrates how to use the combobox component
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState } from 'react';
import { Combobox, useCombobox } from '../src/index';
import type { ComboboxOption } from '../src/types';

// Sample data
const fruits: ComboboxOption<string>[] = [
  { id: '1', label: 'Apple', value: 'apple' },
  { id: '2', label: 'Banana', value: 'banana' },
  { id: '3', label: 'Cherry', value: 'cherry' },
  { id: '4', label: 'Date', value: 'date' },
  { id: '5', label: 'Elderberry', value: 'elderberry' },
  { id: '6', label: 'Fig', value: 'fig' },
  { id: '7', label: 'Grape', value: 'grape' },
  { id: '8', label: 'Honeydew', value: 'honeydew' },
];

const countries: ComboboxOption<string>[] = [
  { id: 'us', label: 'United States', value: 'US' },
  { id: 'gb', label: 'United Kingdom', value: 'GB' },
  { id: 'de', label: 'Germany', value: 'DE' },
  { id: 'fr', label: 'France', value: 'FR' },
  { id: 'jp', label: 'Japan', value: 'JP' },
  { id: 'au', label: 'Australia', value: 'AU' },
  { id: 'ca', label: 'Canada', value: 'CA' },
  { id: 'br', label: 'Brazil', value: 'BR' },
];

/**
 * Combobox types `onChange` as `(value: T | T[] | null) => void` whether or not
 * `multi` is set, so callers have to narrow at the boundary. These two adapters
 * do that in one place. Making the props discriminate on `multi` would remove
 * the need for them — tracked as a typing limitation on the package.
 */
function single<T>(set: (value: T | null) => void) {
  return (next: T | T[] | null) => set(Array.isArray(next) ? next[0] ?? null : next);
}

function multiple<T>(set: (value: T[]) => void) {
  return (next: T | T[] | null) =>
    set(Array.isArray(next) ? next : next === null ? [] : [next]);
}

// Demo 1: Basic Combobox
function BasicExample() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div>
      <h3>Basic Combobox</h3>
      <Combobox
        options={fruits}
        value={value}
        onChange={single(setValue)}
        placeholder="Select a fruit..."
        clearable
      />
      <p style={{ marginTop: '10px' }}>Selected: {value || 'None'}</p>
    </div>
  );
}

// Demo 2: Multi-Select
function MultiSelectExample() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div>
      <h3>Multi-Select Combobox</h3>
      <Combobox
        options={countries}
        value={values}
        onChange={multiple(setValues)}
        multi
        placeholder="Select countries..."
        clearable
      />
      <p style={{ marginTop: '10px' }}>
        Selected: {values.length > 0 ? values.join(', ') : 'None'}
      </p>
    </div>
  );
}

// Demo 3: Creatable
function CreatableExample() {
  const [value, setValue] = useState<string | null>(null);
  const [options, setOptions] = useState(fruits);

  const handleChange = (newValue: string | null) => {
    setValue(newValue);
    // Add new option if it doesn't exist
    if (newValue && !options.find(o => o.value === newValue)) {
      setOptions([...options, {
        id: newValue,
        label: newValue,
        value: newValue,
      }]);
    }
  };

  return (
    <div>
      <h3>Creatable Combobox</h3>
      <Combobox
        options={options}
        value={value}
        onChange={single(handleChange)}
        creatable
        createLabel={(input) => `Create "${input}"`}
        placeholder="Select or create..."
      />
      <p style={{ marginTop: '10px' }}>Selected: {value || 'None'}</p>
    </div>
  );
}

// Demo 4: Async Loading
function AsyncExample() {
  const [value, setValue] = useState<string | null>(null);

  const loadOptions = async (query: string): Promise<ComboboxOption<string>[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return fruits.filter(f => 
      f.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div>
      <h3>Async Loading</h3>
      <Combobox
        loadOptions={loadOptions}
        value={value}
        onChange={single(setValue)}
        placeholder="Search fruits..."
        debounceMs={300}
      />
      <p style={{ marginTop: '10px' }}>Selected: {value || 'None'}</p>
    </div>
  );
}

// Demo 5: Using the Hook (Custom UI)
function HookExample() {
  const [value, setValue] = useState<string | null>(null);

  const {
    inputProps,
    inputRef,
    listboxProps,
    isOpen,
    highlightedIndex,
    filteredOptions,
    selectOption,
    highlightOption,
    clearSelection,
    inputValue,
    isSelected,
    getOptionId,
  } = useCombobox({
    options: fruits,
    value,
    onChange: single(setValue),
  });

  return (
    <div>
      <h3>Custom UI with Hook</h3>
      <div style={{ position: 'relative', width: '300px' }}>
        <input
          {...inputProps}
          ref={inputRef}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            fontSize: '16px',
          }}
          placeholder="Search..."
        />
        {value && (
          <button
            onClick={() => clearSelection()}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        )}
        {isOpen && filteredOptions.length > 0 && (
          <ul
            {...listboxProps}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '200px',
              overflow: 'auto',
              listStyle: 'none',
              padding: 0,
              zIndex: 1000,
            }}
          >
            {filteredOptions.map((option, index) => (
              <li
                key={option.id}
                id={getOptionId(index)}
                onClick={() => selectOption(index)}
                onMouseEnter={() => highlightOption(index)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  background: index === highlightedIndex ? '#eff6ff' : 'transparent',
                  color: isSelected(option) ? '#3b82f6' : 'inherit',
                  fontWeight: isSelected(option) ? 'bold' : 'normal',
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p style={{ marginTop: '10px' }}>Selected: {value || 'None'}</p>
    </div>
  );
}

// Demo 6: Disabled Options
function DisabledOptionsExample() {
  const [value, setValue] = useState<string | null>(null);

  const optionsWithDisabled: ComboboxOption<string>[] = [
    { id: '1', label: 'Available Option 1', value: 'opt1' },
    { id: '2', label: 'Disabled Option', value: 'opt2', disabled: true },
    { id: '3', label: 'Available Option 2', value: 'opt3' },
    { id: '4', label: 'Also Disabled', value: 'opt4', disabled: true },
    { id: '5', label: 'Available Option 3', value: 'opt5' },
  ];

  return (
    <div>
      <h3>Disabled Options</h3>
      <Combobox
        options={optionsWithDisabled}
        value={value}
        onChange={single(setValue)}
        placeholder="Select an option..."
      />
      <p style={{ marginTop: '10px' }}>Selected: {value || 'None'}</p>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/combobox Demo</h1>
      
      <BasicExample />
      <hr style={{ margin: '30px 0' }} />
      
      <MultiSelectExample />
      <hr style={{ margin: '30px 0' }} />
      
      <CreatableExample />
      <hr style={{ margin: '30px 0' }} />
      
      <AsyncExample />
      <hr style={{ margin: '30px 0' }} />
      
      <HookExample />
      <hr style={{ margin: '30px 0' }} />
      
      <DisabledOptionsExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, MultiSelectExample, CreatableExample, AsyncExample, HookExample, DisabledOptionsExample };

// Default export
export default DemoApp;

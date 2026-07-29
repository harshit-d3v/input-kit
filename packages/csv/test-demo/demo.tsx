/**
 * React demo for @input-kit/csv
 * This file demonstrates all features of the CSV package
 */

import React, { useState } from 'react';
import { parseCSV, stringifyCSV } from '../src/index';

export function CSVParserDemo() {
  const [input, setInput] = useState(`name,age,city,occupation
John Doe,30,New York,Engineer
Jane Smith,25,Los Angeles,Designer
Bob Johnson,35,Chicago,Manager
Alice Williams,28,Seattle,Developer`);
  
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);

  const parsed = parseCSV(input, {
    delimiter,
    header: hasHeader,
    skipEmptyLines,
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>CSV Parser Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Options</h3>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
          />
          {' '}Has Header Row
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={skipEmptyLines}
            onChange={(e) => setSkipEmptyLines(e.target.checked)}
          />
          {' '}Skip Empty Lines
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Delimiter: {' '}
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
            <option value=",">Comma (,)</option>
            <option value="|">Pipe (|)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>CSV Input</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: '100%',
            height: '150px',
            fontFamily: 'monospace',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div>
        <h3>Parsed Output</h3>
        <div style={{ marginBottom: '10px' }}>
          <strong>Meta:</strong> {parsed.meta.rowCount} rows
          {parsed.meta.fields && ` | Fields: ${parsed.meta.fields.join(', ')}`}
        </div>
        {parsed.errors.length > 0 && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            <strong>Errors:</strong>
            <ul>
              {parsed.errors.map((err, i) => (
                <li key={i}>Row {err.row}: {err.message}</li>
              ))}
            </ul>
          </div>
        )}
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
        }}>
          {JSON.stringify(parsed.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function CSVStringifierDemo() {
  const [data, setData] = useState([
    { name: 'John', age: '30', city: 'NYC' },
    { name: 'Jane', age: '25', city: 'LA' },
  ]);
  
  const [newRow, setNewRow] = useState({ name: '', age: '', city: '' });
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeader, setIncludeHeader] = useState(true);

  const csvOutput = stringifyCSV(data, {
    delimiter,
    header: includeHeader,
  });

  const addRow = () => {
    setData([...data, newRow]);
    setNewRow({ name: '', age: '', city: '' });
  };

  const removeRow = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>CSV Stringifier Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Options</h3>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={includeHeader}
            onChange={(e) => setIncludeHeader(e.target.checked)}
          />
          {' '}Include Header
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Delimiter: {' '}
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
            <option value=",">Comma (,)</option>
            <option value="|">Pipe (|)</option>
            <option value=";">Semicolon (;)</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Data Table</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Age</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>City</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.age}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.city}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => removeRow(i)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: '10px' }}>
          <input
            placeholder="Name"
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
            style={{ marginRight: '5px', padding: '5px' }}
          />
          <input
            placeholder="Age"
            value={newRow.age}
            onChange={(e) => setNewRow({ ...newRow, age: e.target.value })}
            style={{ marginRight: '5px', padding: '5px' }}
          />
          <input
            placeholder="City"
            value={newRow.city}
            onChange={(e) => setNewRow({ ...newRow, city: e.target.value })}
            style={{ marginRight: '5px', padding: '5px' }}
          />
          <button onClick={addRow}>Add Row</button>
        </div>
      </div>

      <div>
        <h3>CSV Output</h3>
        <textarea
          value={csvOutput}
          readOnly
          style={{
            width: '100%',
            height: '150px',
            fontFamily: 'monospace',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#f9f9f9',
          }}
        />
        <button
          onClick={() => navigator.clipboard.writeText(csvOutput)}
          style={{ marginTop: '10px', padding: '8px 16px' }}
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}

export function DemoApp() {
  const [activeTab, setActiveTab] = useState<'parser' | 'stringifier'>('parser');

  return (
    <div>
      <div style={{ borderBottom: '1px solid #ccc', padding: '10px 20px' }}>
        <button
          onClick={() => setActiveTab('parser')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            background: activeTab === 'parser' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'parser' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Parser
        </button>
        <button
          onClick={() => setActiveTab('stringifier')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'stringifier' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'stringifier' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Stringifier
        </button>
      </div>

      {activeTab === 'parser' ? <CSVParserDemo /> : <CSVStringifierDemo />}
    </div>
  );
}

// For direct rendering
if (typeof window !== 'undefined') {
  console.log('CSV Demo loaded. Use <DemoApp /> component to render.');
}

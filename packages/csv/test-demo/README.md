# Test Demo for @input-kit/csv

This folder contains demo and test files for the CSV parser package.

## Files

| File | Description |
|------|-------------|
| `demo.tsx` | React component demos showing all features |
| `index.html` | Standalone HTML demo (no build required) |
| `test-imports.ts` | Tests all imports and utility functions |
| `serve.cjs` | Local server for running the HTML demo |

## Quick Start

### Visual Test (HTML Demo) - RECOMMENDED

```bash
# Start the server
cd input-kit-csv
node test-demo/serve.cjs

# Then open http://localhost:3000 in your browser
```

Or simply open `test-demo/index.html` directly in your browser.

### Test Imports & Utilities

```bash
npx tsx test-demo/test-imports.ts
```

## Features Demonstrated

### 1. CSV Parser
- Parse CSV strings with headers
- Custom delimiters (comma, pipe, semicolon, tab)
- Handle quoted values
- Escape quote characters
- Skip empty lines
- Error handling

### 2. CSV Stringifier
- Convert JSON to CSV
- Include/exclude headers
- Custom delimiters
- Automatic value quoting
- Interactive table editor

### 3. Options

#### Parser Options
- `delimiter`: Field separator (default: `,`)
- `newline`: Line separator (default: `\n`)
- `quoteChar`: Quote character (default: `"`)
- `header`: First row is header (default: `true`)
- `skipEmptyLines`: Skip empty lines (default: `true`)

#### Stringifier Options
- `delimiter`: Field separator (default: `,`)
- `newline`: Line separator (default: `\n`)
- `quoteChar`: Quote character (default: `"`)
- `header`: Include header row (default: `true`)

## What's Tested

### Parser Tests
- ✅ Simple CSV with headers
- ✅ CSV without headers
- ✅ Quoted values with special characters
- ✅ Escaped quotes
- ✅ Custom delimiters
- ✅ Empty lines handling
- ✅ Empty CSV
- ✅ CSV with only headers

### Stringifier Tests
- ✅ Array of objects to CSV
- ✅ Include/exclude headers
- ✅ Automatic quoting for special characters
- ✅ Quote escaping
- ✅ Custom delimiters
- ✅ Empty arrays
- ✅ Values with newlines

### Round-trip Tests
- ✅ Parse → Stringify → Parse integrity
- ✅ Special character preservation

# @input-kit/csv

Zero-dependency CSV parser, formatter, and async stream reader for TypeScript/JavaScript.

## Installation

```bash
npm install @input-kit/csv
```

## Quick Start

```ts
import { parseCSV, stringifyCSV } from '@input-kit/csv';

const result = parseCSV(`name,age\nAlice,30\nBob,25`);
// result.data → [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]

const csv = stringifyCSV([{ name: 'Alice', age: '30' }]);
// "name,age\nAlice,30"
```

## API Reference

### `parseCSV(csv, options?)`

Parses a CSV string into an array of objects (with header) or arrays (without).

```ts
function parseCSV<T = Record<string, string>>(
  csv: string,
  options?: ParseOptions
): ParseResult<T>
```

**`ParseOptions`**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delimiter` | `string` | `','` | Field separator |
| `newline` | `string` | `'\n'` | Row separator |
| `quoteChar` | `string` | `'"'` | Quote character for fields with special chars |
| `escapeChar` | `string` | `'"'` | Escape character inside quoted fields |
| `header` | `boolean` | `true` | Treat first row as header |
| `skipEmptyLines` | `boolean` | `true` | Skip blank lines |

**`ParseResult<T>`**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T[]` | Parsed rows |
| `errors` | `Array<{ row: number; message: string }>` | Row-level parse errors |
| `meta.fields` | `string[] \| undefined` | Header fields (when `header: true`) |
| `meta.rowCount` | `number` | Number of data rows |

---

### `stringifyCSV(data, options?)`

Serialises an array of objects to a CSV string. Fields containing the delimiter, newline, or quote character are automatically quoted and escaped.

```ts
function stringifyCSV<T = Record<string, string>>(
  data: T[],
  options?: StringifyOptions
): string
```

**`StringifyOptions`**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delimiter` | `string` | `','` | Field separator |
| `newline` | `string` | `'\n'` | Row separator |
| `quoteChar` | `string` | `'"'` | Quote character |
| `header` | `boolean` | `true` | Emit a header row from object keys |

---

### `parseCSVStream(stream, options?)`

Async generator for memory-efficient parsing of large CSV `ReadableStream<string>` sources. Yields one `Record<string, string>` per row.

```ts
async function* parseCSVStream(
  stream: ReadableStream<string>,
  options?: ParseOptions
): AsyncGenerator<Record<string, string>>
```

```ts
const stream = response.body!.pipeThrough(new TextDecoderStream());
for await (const row of parseCSVStream(stream)) {
  console.log(row);
}
```

---

## Types

```ts
interface ParseOptions {
  delimiter?: string;
  newline?: string;
  quoteChar?: string;
  escapeChar?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
}

interface ParseResult<T = Record<string, string>> {
  data: T[];
  errors: Array<{ row: number; message: string }>;
  meta: { fields?: string[]; rowCount: number };
}

interface StringifyOptions {
  delimiter?: string;
  newline?: string;
  quoteChar?: string;
  header?: boolean;
}
```

## License

MIT © Input Kit

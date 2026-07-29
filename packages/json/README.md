# @input-kit/json

React JSON tree viewer with collapsible objects and arrays, theme support, optional clipboard copy, and utility helpers for formatting and validation.

## Installation

```bash
npm install @input-kit/json
```

## Quick Start

```tsx
import { JSONViewer } from '@input-kit/json';

const data = {
	user: { id: 1, name: 'Ada Lovelace' },
	tags: ['math', 'logic'],
};

function Example() {
	return <JSONViewer data={data} collapsed theme="dark" enableClipboard />;
}
```

## Component

### `JSONViewer`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `unknown` | — | JSON-compatible value to render |
| `collapsed` | `boolean` | `false` | Collapse nested nodes by default |
| `collapseStringsAfterLength` | `number` | — | Truncate long string values after the specified length |
| `displayDataTypes` | `boolean` | `true` | Show `(string)`, `(number)`, and similar suffixes |
| `displayObjectSize` | `boolean` | `true` | Show item or key counts next to arrays/objects |
| `enableClipboard` | `boolean` | `false` | Show a `Copy JSON` button when the Clipboard API is available |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in color theme |

## Utilities

### `formatJSON(data, indent?)`

Formats a value with `JSON.stringify(data, null, indent)`.

```ts
formatJSON({ a: 1 }, 2);
// {
//   "a": 1
// }
```

### `isValidJSON(value)`

Returns `true` if the string parses successfully.

```ts
isValidJSON('{"ok":true}'); // true
isValidJSON('{oops}');      // false
```

## Notes

- Collapse state for nested nodes follows the `collapsed` prop and re-syncs when the prop changes.
- Clipboard copy uses the browser Clipboard API and silently no-ops when unavailable.
- String truncation only affects display; the full string remains available in the tooltip.

## License

MIT © Input Kit

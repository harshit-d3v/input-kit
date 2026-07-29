# @input-kit/search

Debounced React search utilities with a headless hook and a small ready-to-use search input component.

## Installation

```bash
npm install @input-kit/search
```

## Quick Start

```tsx
import { SearchInput } from '@input-kit/search';

function Example() {
	return (
		<SearchInput
			placeholder="Search products"
			debounceMs={250}
			onSearch={(value) => console.log('Searching:', value)}
		/>
	);
}
```

## Exports

### `useSearch(options?)`

Returns:

- `value`
- `debouncedValue`
- `setValue(value)`
- `clear()`

Options:

| Option | Type | Default | Description |
|------|------|---------|-------------|
| `debounceMs` | `number` | `300` | Delay before updating `debouncedValue` |
| `onSearch` | `(value: string) => void` | - | Called after the debounce delay |
| `initialValue` | `string` | `''` | Initial search value |

### `SearchInput`

Small controlled/uncontrolled search field component.

Important props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search...'` | Input placeholder |
| `debounceMs` | `number` | `300` | Debounce delay |
| `onSearch` | `(value: string) => void` | - | Debounced callback |
| `onChange` | `(value: string) => void` | - | Immediate callback on every keystroke |
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | `''` | Uncontrolled initial value |
| `autoFocus` | `boolean` | `false` | Focus on mount |
| `className` | `string` | - | Input class |

All other standard input props are forwarded to the rendered `<input>`.

## Notes

- The hook stores the latest `onSearch` callback in a ref to avoid stale closures.
- The component uses `type="search"` by default.

## License

MIT © Input Kit

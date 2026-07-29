# @input-kit/resize

React hooks for observing element size, window size, bounds, overflow, aspect ratio, and container breakpoints with optional debounce support.

## Installation

```bash
npm install @input-kit/resize
```

## Quick Start

```tsx
import { useElementSize } from '@input-kit/resize';

function Example() {
	const [ref, size] = useElementSize();

	return (
		<div ref={ref} style={{ resize: 'both', overflow: 'auto' }}>
			{size.width} × {size.height}
		</div>
	);
}
```

## Hooks

### `useResizeObserver(options?)`

Low-level hook that returns `{ ref, size, entry }`.

### `useElementSize(options?)`

Returns `[ref, size]` for straightforward width and height tracking.

### `useWindowSize(options?)`

Tracks the browser viewport size and supports optional debouncing.

### `useContainerQuery(breakpoints)`

Returns `[ref, matches]` where `matches` maps each breakpoint key to a boolean.

### `useAspectRatio()`

Returns `[ref, aspectRatio]` for the observed element.

### `useOverflow()`

Returns `[ref, { horizontal, vertical }]` to detect content overflow.

### `useElementBounds()`

Returns `[ref, DOMRect | null]` with live position and size updates.

### `observeElements(elements, callback, options?)`

Utility for directly observing multiple DOM elements.

## Extras

- `defaultBreakpoints` includes `xs`, `sm`, `md`, `lg`, `xl`, and `2xl`.
- Debounced listeners cancel their pending timeouts on cleanup.

## Notes

- Hooks degrade safely when `ResizeObserver` is unavailable.
- `useWindowSize` is SSR-safe and initializes to `0 × 0` on the server.

## License

MIT © Input Kit

# @input-kit/fullscreen

Headless React hook for controlling the Fullscreen API on a target element or the whole document.

## Installation

```bash
npm install @input-kit/fullscreen
```

## Quick Start

```tsx
import { useRef } from 'react';
import { useFullscreen } from '@input-kit/fullscreen';

function Player() {
	const ref = useRef<HTMLDivElement>(null);
	const { isFullscreen, toggle } = useFullscreen(ref);

	return (
		<div ref={ref}>
			<button onClick={toggle}>
				{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
			</button>
		</div>
	);
}
```

## API

### `useFullscreen(elementRef?)`

```ts
function useFullscreen(
	elementRef?: RefObject<Element | null>
): {
	isFullscreen: boolean;
	enter: () => Promise<void>;
	exit: () => Promise<void>;
	toggle: () => Promise<void>;
}
```

If `elementRef` is omitted, the hook falls back to `document.documentElement`.

| Return value | Type | Description |
|--------------|------|-------------|
| `isFullscreen` | `boolean` | Whether the browser is currently in fullscreen mode |
| `enter` | `() => Promise<void>` | Requests fullscreen for the target element |
| `exit` | `() => Promise<void>` | Exits fullscreen mode |
| `toggle` | `() => Promise<void>` | Switches between enter and exit |

## Notes

- Fullscreen requests must usually be triggered by a user gesture such as a click.
- The hook includes vendor-prefixed fallbacks for older browser implementations.
- Browsers can reject fullscreen requests based on permissions or platform restrictions.

## License

MIT © Input Kit

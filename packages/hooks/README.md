# @input-kit/hooks

Reusable React hooks for timing, browser APIs, storage, keyboard input, viewport state, and DOM observation.

## Installation

```bash
npm install @input-kit/hooks
```

## Available hooks

| Hook | Purpose |
|------|---------|
| `useDebounce` | Delay updates to a fast-changing value |
| `useThrottle` | Throttle value updates |
| `useLocalStorage` | Persist state in `localStorage` |
| `useSessionStorage` | Persist state in `sessionStorage` |
| `useMediaQuery` | React to CSS media query matches |
| `useIntersectionObserver` | Track whether an element is visible |
| `usePrevious` | Keep the previous render value |
| `useCountdown` | Countdown timer with start, pause, resume, reset, and stop |
| `useNetworkStatus` | Read online state and connection metadata |
| `useClipboard` | Copy text and track copied state |
| `useFullscreen` | Control fullscreen mode for an element |
| `useResizeObserver` | Observe element width and height |
| `useClickOutside` | Run a callback when the user clicks outside an element |
| `useKeyPress` | Detect a single key press |
| `useKeyPressMultiple` | Detect multiple active keys |
| `useScrollPosition` | Read scroll coordinates |

The package also exports `breakpoints` from `useMediaQuery`.

## Quick examples

### Debounce input

```tsx
import { useState } from 'react';
import { useDebounce } from '@input-kit/hooks';

function SearchBox() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 300);

  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <p>Search for: {debouncedValue}</p>
    </>
  );
}
```

### Persist state

```tsx
import { useLocalStorage } from '@input-kit/hooks';

function Preferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme((prev) => prev === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  );
}
```

### Clipboard

```tsx
import { useClipboard } from '@input-kit/hooks';

function CopyButton() {
  const { copy, copied } = useClipboard(1500);

  return (
    <button onClick={() => copy('Hello world')}>
      {copied ? 'Copied!' : 'Copy text'}
    </button>
  );
}
```

### Fullscreen

```tsx
import { useRef } from 'react';
import { useFullscreen } from '@input-kit/hooks';

function CanvasPreview() {
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

## Notes

- Storage hooks accept updater functions, so `setValue((prev) => next)` works reliably.
- `useClipboard` uses the browser Clipboard API and returns `false` when it is unavailable.
- `useFullscreen` relies on a browser user gesture for successful entry into fullscreen mode.

## License

MIT © Input Kit

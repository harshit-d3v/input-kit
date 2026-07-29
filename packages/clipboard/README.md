# @input-kit/clipboard

Headless clipboard utilities for React — copy text to clipboard with state tracking, auto-reset, and a legacy `execCommand` fallback for non-HTTPS environments.

## Installation

```bash
npm install @input-kit/clipboard
```

## Usage

### `useClipboard` hook

The main hook. Returns `copied` state that auto-resets after `timeout` ms.

```tsx
import { useClipboard } from '@input-kit/clipboard';

function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useClipboard({ timeout: 2000 });

  return (
    <button onClick={() => copy(text)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `2000` | ms before `copied` resets to `false` |

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `copy` | `(text: string) => Promise<boolean>` | Writes text to clipboard; returns `true` on success |
| `copied` | `boolean` | `true` for `timeout` ms after a successful copy |
| `reset` | `() => void` | Manually resets `copied` and cancels the pending timer |

---

### `copyToClipboard`

Standalone async utility — no React required.

```ts
import { copyToClipboard } from '@input-kit/clipboard';

const ok = await copyToClipboard('Hello, world!');
```

---

### `readFromClipboard`

Reads the current clipboard text. Only works in secure contexts (HTTPS / `localhost`) and requires browser permission.

```ts
import { readFromClipboard } from '@input-kit/clipboard';

const text = await readFromClipboard(); // string | null
```

---

## Browser support

Uses the modern `navigator.clipboard` API when available (requires a secure context). Falls back to the legacy `document.execCommand('copy')` path for older browsers and `http://` environments.

## Peer dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19

## License

MIT © Harshit

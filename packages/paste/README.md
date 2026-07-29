# @input-kit/paste

React utilities for handling clipboard paste events, scoped paste zones, manual clipboard reads, and pasted file or image filtering.

## Installation

```bash
npm install @input-kit/paste
```

## Quick Start

```tsx
import { PasteZone } from '@input-kit/paste';

function Example() {
	return (
		<PasteZone
			onPasteText={(text) => console.log(text)}
			onPasteImages={(images) => console.log(images)}
			style={{ minHeight: 160, border: '2px dashed #cbd5e1', borderRadius: 12 }}
		>
			<div style={{ padding: 24 }}>Focus this box and press Ctrl+V</div>
		</PasteZone>
	);
}
```

## Exports

### `usePaste(options?)`

Adds a document-level paste listener and returns:

- `lastPaste`
- `isPasting`
- `pasteFromClipboard()`
- `clearLastPaste()`

Options:

| Option | Type | Default | Description |
|------|------|---------|-------------|
| `onPaste` | `(data: PasteData) => void` | - | Called with the full parsed payload |
| `onPasteText` | `(text: string) => void` | - | Called when pasted text is available |
| `onPasteFiles` | `(files: File[]) => void` | - | Called when pasted files are available |
| `onPasteImages` | `(images: File[]) => void` | - | Called when pasted images are available |
| `enabled` | `boolean` | `true` | Enable or disable listening |
| `preventDefault` | `boolean` | `true` | Prevent the browser default paste behavior |
| `acceptedTypes` | `string[]` | - | MIME types or file extensions to keep |
| `maxFileSize` | `number` | - | Maximum file size in bytes |

### `usePasteZone(ref, options?)`

Same API as `usePaste`, but scoped to a specific element ref.

### `PasteZone`

Focusable wrapper component that wires `usePasteZone` for you.

Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPaste` | `(data: PasteData) => void` | - | Full paste callback |
| `onPasteText` | `(text: string) => void` | - | Text callback |
| `onPasteFiles` | `(files: File[]) => void` | - | File callback |
| `onPasteImages` | `(images: File[]) => void` | - | Image callback |
| `acceptedTypes` | `string[]` | - | Allowed MIME types or extensions |
| `maxFileSize` | `number` | - | File size limit in bytes |
| `disabled` | `boolean` | `false` | Disable the zone |
| `showIndicator` | `boolean` | `true` | Show the paste hint when focused |
| `className` | `string` | - | Wrapper class |
| `style` | `React.CSSProperties` | - | Wrapper styles |

### Helpers

- `pasteImageToDataUrl(file)`
- `readTextFromClipboard()`
- `clipboardHasImage()`

## Notes

- Clipboard read helpers are SSR-safe and return empty results when clipboard APIs are unavailable.
- File filtering applies both MIME/extension matching and maximum-size filtering.

## License

MIT © Input Kit

# @input-kit/dropzone

Headless file dropzone hook and component for React. Fully typed, keyboard accessible, with image preview support and automatic cleanup of object URLs.

## Comparison with react-dropzone

| Feature | @input-kit/dropzone | react-dropzone |
|---|---|---|
| Bundle size | ~4 KB | ~20 KB |
| Dependencies | zero | file-selector |
| TypeScript | full | full |
| Keyboard (Space/Enter) | yes | yes |
| Image previews | built-in | manual (onDrop) |
| File type accept format | string/string[] | MIME object `{ 'image/*': ['.png'] }` |
| Object URL cleanup | auto on unmount | manual |
| SSR | safe | safe |

## Installation

```bash
npm install @input-kit/dropzone
```

## Quick Start

```tsx
import { useDropzone } from '@input-kit/dropzone';

function MyDropzone() {
  const { getRootProps, getInputProps, files, removeFile } = useDropzone({
    accept: 'image/*',
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5 MB
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: 32 }}>
      <input {...getInputProps()} />
      <p>Drag files here or press Space / Enter to browse</p>
      {files.map(f => (
        <div key={f.id}>
          {f.preview && <img src={f.preview} width={80} alt={f.name} />}
          <span>{f.name}</span>
          <button onClick={() => removeFile(f.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## Drop-in `Dropzone` component

```tsx
import { Dropzone } from '@input-kit/dropzone';

<Dropzone
  accept="image/*,.pdf"
  maxSize={10 * 1024 * 1024}
  maxFiles={3}
  onDrop={(files) => console.log(files)}
  onRemove={(file) => console.log('removed', file.name)}
/>
```

## API

### `useDropzone(options?)`

```ts
const {
  files,          // FileWithPreview[] — accepted files
  isDragActive,   // boolean — drag is over the zone
  isDragAccept,   // boolean — all dragged files appear valid
  isDragReject,   // boolean — some dragged files appear invalid
  getRootProps,   // () => root element props (drag, click, keyboard)
  getInputProps,  // () => hidden <input> props
  open,           // () => void — programmatically open file dialog
  removeFile,     // (id: string) => void — remove a file and revoke its preview URL
  clearFiles,     // () => void — remove all files
} = useDropzone(options);
```

### `UseDropzoneOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `accept` | `string \| string[]` | — | Accepted MIME types or extensions. e.g. `'image/*'`, `['.pdf', '.docx']` |
| `maxSize` | `number` | `Infinity` | Maximum file size in bytes |
| `maxFiles` | `number` | `Infinity` | Maximum number of accepted files |
| `multiple` | `boolean` | `true` | Allow multiple files |
| `disabled` | `boolean` | `false` | Disable all interaction |
| `onDrop` | `(accepted, rejected) => void` | — | Called after every drop |
| `onDropAccepted` | `(files) => void` | — | Called when at least one file is accepted |
| `onDropRejected` | `(rejections) => void` | — | Called when at least one file is rejected |
| `validator` | `(file) => FileRejection \| null` | — | Custom per-file validator |

### `FileWithPreview`

Extends `File` with two additional fields:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID for use as React key |
| `preview` | `string \| undefined` | Object URL for image files (revoked automatically on removal/unmount) |

### `FileRejection`

```ts
interface FileRejection {
  file: File;
  errors: FileError[];
}

interface FileError {
  code: 'file-too-large' | 'file-invalid-type' | 'too-many-files' | 'custom';
  message: string;
}
```

### `DropzoneProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `accept` | `string \| string[]` | — | Accepted types/extensions |
| `maxSize` | `number` | — | Max file size in bytes |
| `maxFiles` | `number` | — | Max accepted file count |
| `multiple` | `boolean` | `true` | Allow multiple files |
| `disabled` | `boolean` | `false` | Disable interaction |
| `onDrop` | `(files: File[]) => void` | — | Called with accepted files |
| `onRemove` | `(file: FileWithPreview) => void` | — | Called when a file is removed |
| `showPreview` | `boolean` | `true` | Show built-in file list preview |
| `className` | `string` | — | Class for the outer wrapper |
| `style` | `CSSProperties` | — | Style for the outer wrapper |
| `children` | `ReactNode \| ((state: { isDragActive }) => ReactNode)` | — | Custom render content |

## Keyboard Accessibility

The root element receives `tabIndex={0}`, `role="button"`, and an `aria-label`. **Space** and **Enter** open the file dialog, matching the behaviour of `react-dropzone`.

## File Type Validation

Accepts the same `accept` string as the HTML `<input type="file">` attribute:

```tsx
useDropzone({ accept: 'image/png,image/jpeg' })
useDropzone({ accept: ['.pdf', '.docx', 'image/*'] })
```

> **Note:** Browsers do not expose MIME types during drag events for security reasons. `isDragAccept` and `isDragReject` are best-effort during drag and are reliable only after the drop.

## Notes vs react-dropzone

- `react-dropzone`'s `accept` format is `{ 'image/*': ['.png'] }` (MIME object)
- `@input-kit/dropzone` uses the simpler HTML `accept` string format consistently
- Image preview URLs are generated automatically and revoked on `removeFile`, `clearFiles`, or component unmount — no manual cleanup needed
- `react-dropzone` has `noClick`, `noDrag`, `noKeyboard` escape hatches; this package does not currently expose them

## TypeScript

```ts
import type { FileWithPreview, FileRejection, FileError, UseDropzoneOptions, DropzoneProps } from '@input-kit/dropzone';
```

## License

MIT © Harshit

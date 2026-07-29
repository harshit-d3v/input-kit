# @input-kit/crop

Headless image cropping hook and `ImageCropper` component for React — drag-to-move, 8-handle resize, zoom, rotation, aspect-ratio lock, and canvas-based export.

## Installation

```bash
npm install @input-kit/crop
```

## Quick Start

```tsx
import { ImageCropper } from '@input-kit/crop';

function Avatar() {
  return (
    <ImageCropper
      src="/my-photo.jpg"
      aspectRatio={1}
      showGrid
      showZoom
      onCropComplete={(result) => {
        console.log(result.dataUrl);  // base64 PNG
        upload(result.blob);
      }}
    />
  );
}
```

## API Reference

### `ImageCropper` component

Pre-built cropper UI with image display, crop overlay, zoom/rotation sliders, and a Crop button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image URL *(required)* |
| `aspectRatio` | `number` | — | Lock aspect ratio as `width / height` (e.g. `1` for square, `16/9`) |
| `minWidth` | `number` | `50` | Minimum crop width in px |
| `minHeight` | `number` | `50` | Minimum crop height in px |
| `showGrid` | `boolean` | `true` | Show rule-of-thirds grid lines |
| `showZoom` | `boolean` | `true` | Show zoom slider |
| `showRotation` | `boolean` | `true` | Show rotation slider |
| `onCropComplete` | `(result: CropResult) => void` | — | Called with the cropped image data |
| `className` | `string` | — | Extra CSS class on the wrapper |
| `style` | `CSSProperties` | — | Inline styles on the wrapper |

---

### `useCrop` hook

Headless hook for building a fully custom cropper UI.

```tsx
import { useCrop } from '@input-kit/crop';

function CustomCropper() {
  const {
    cropArea, setCropArea,
    zoom, setZoom,
    rotation, setRotation,
    isDragging, isResizing,
    handleMouseDown, handleMouseMove, handleMouseUp,
    reset,
  } = useCrop({ aspectRatio: 16 / 9, minWidth: 100 });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative', width: 600, height: 400 }}
    >
      <img src="/photo.jpg" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        style={{ position: 'absolute', left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height, border: '2px solid white', cursor: 'grab' }}
      />
    </div>
  );
}
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `aspectRatio` | `number` | — | Locked aspect ratio |
| `minWidth` | `number` | `50` | Minimum crop width |
| `minHeight` | `number` | `50` | Minimum crop height |
| `maxWidth` | `number` | `Infinity` | Maximum crop width |
| `maxHeight` | `number` | `Infinity` | Maximum crop height |

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `cropArea` | `CropArea` | Current crop rectangle `{ x, y, width, height }` |
| `setCropArea` | `(area: CropArea) => void` | Set crop area (constraints applied) |
| `zoom` | `number` | Current zoom level |
| `setZoom` | `(z: number) => void` | Set zoom |
| `rotation` | `number` | Current rotation in degrees |
| `setRotation` | `(r: number) => void` | Set rotation |
| `isDragging` | `boolean` | Whether the crop box is being dragged |
| `isResizing` | `boolean` | Whether a resize handle is active |
| `handleMouseDown` | `(e, type, handle?) => void` | Spread onto the crop box / resize handles |
| `handleMouseMove` | `(e) => void` | Spread onto the container |
| `handleMouseUp` | `() => void` | Spread onto the container |
| `reset` | `() => void` | Reset crop area, zoom, and rotation to defaults |

---

### `cropImage` utility

Renders the cropped region to a canvas and returns a `Blob` and `dataUrl`.

```ts
import { cropImage } from '@input-kit/crop';

const result = await cropImage(src, cropArea, zoom, rotation);
// result.blob    — Blob (PNG), null if image failed to load
// result.dataUrl — base64 PNG string
// result.width / result.height
```

> The image is fetched with `crossOrigin = 'anonymous'`. Make sure your server sends CORS headers if the image is cross-origin.

---

## Types

```ts
interface CropArea { x: number; y: number; width: number; height: number; }

interface CropResult {
  blob: Blob | null;
  dataUrl: string;
  width: number;
  height: number;
}
```

## Resize handles

The `handleMouseDown(e, 'resize', handle)` call accepts these handle identifiers:

`nw` `n` `ne` `w` `e` `sw` `s` `se`

## Peer dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19

## License

MIT © Input Kit

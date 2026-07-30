import React, { useState } from 'react';
import { ImageCropper, useCrop } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };
const mono: React.CSSProperties = {
  fontFamily: 'monospace',
  background: '#f3f4f6',
  padding: '2px 6px',
  borderRadius: '4px',
};

// A self-contained SVG so the demo needs no network access.
const SAMPLE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#g)"/>
      <circle cx="200" cy="150" r="70" fill="rgba(255,255,255,0.35)"/>
      <rect x="330" y="220" width="200" height="130" rx="16" fill="rgba(255,255,255,0.28)"/>
      <text x="320" y="70" font-family="sans-serif" font-size="28" fill="#fff" text-anchor="middle">
        drag to crop
      </text>
    </svg>`
  );

const ASPECTS: Array<{ label: string; value: number | undefined }> = [
  { label: 'free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

// ─── 1. The cropper component ─────────────────────────────────────────────────
function CropperExample() {
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<string | null>(null);

  return (
    <div style={section}>
      <h2>ImageCropper</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {ASPECTS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setAspect(value)}
            style={{
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: aspect === value ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ImageCropper
        key={String(aspect)}
        src={SAMPLE}
        aspectRatio={aspect}
        showGrid
        showZoom
        showRotation
        onCropComplete={(r) => setResult(r.dataUrl)}
      />
      <p style={note}>
        Drag inside the selection to move it, or grab an edge or corner to resize.
        Corner and edge handles keep the opposite edge pinned, so the box stops at the
        minimum size instead of sliding away under the pointer.
      </p>
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '14px' }}>Result</h3>
          <img src={result} alt="Cropped result" style={{ maxWidth: '100%', border: '1px solid #e5e7eb' }} />
        </div>
      )}
    </div>
  );
}

// ─── 2. Aspect ratio behaviour ────────────────────────────────────────────────
function AspectExample() {
  return (
    <div style={section}>
      <h2>Aspect ratio</h2>
      <p style={note}>
        With a ratio set, height follows width — so the north and south handles express
        their drag as a width change rather than doing nothing.
      </p>
      <ImageCropper src={SAMPLE} aspectRatio={1} showGrid />
    </div>
  );
}

// ─── 3. The hook ──────────────────────────────────────────────────────────────
function HookExample() {
  const crop = useCrop({ aspectRatio: 16 / 9, minWidth: 80, minHeight: 45 });

  return (
    <div style={section}>
      <h2>useCrop</h2>
      <p style={note}>
        Area: <span style={mono}>
          x {Math.round(crop.cropArea.x)}, y {Math.round(crop.cropArea.y)},{' '}
          {Math.round(crop.cropArea.width)} × {Math.round(crop.cropArea.height)}
        </span>
      </p>
      <p style={note}>
        zoom <span style={mono}>{crop.zoom.toFixed(2)}</span> · rotation{' '}
        <span style={mono}>{crop.rotation}°</span> · dragging{' '}
        <span style={mono}>{String(crop.isDragging)}</span>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => crop.setZoom(crop.zoom + 0.25)} style={{ cursor: 'pointer' }}>Zoom in</button>
        <button onClick={() => crop.setZoom(Math.max(0.25, crop.zoom - 0.25))} style={{ cursor: 'pointer' }}>Zoom out</button>
        <button onClick={() => crop.setRotation((crop.rotation + 90) % 360)} style={{ cursor: 'pointer' }}>Rotate</button>
        <button onClick={crop.reset} style={{ cursor: 'pointer' }}>Reset</button>
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/crop</h1>
      <p>Image cropper with draggable handles, aspect ratios, zoom and rotation.</p>
      <CropperExample />
      <AspectExample />
      <HookExample />
    </div>
  );
}

export default Demo;

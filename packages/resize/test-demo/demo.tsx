import React from 'react';
import { useElementSize, useWindowSize } from '../src/index';

export function Demo() {
  const [panelRef, panelSize] = useElementSize<HTMLDivElement>({
    debounceMs: 80,
    defaultSize: { width: 320, height: 220 },
  });
  const viewport = useWindowSize({ debounceMs: 80 });
  const ratio = panelSize.height > 0 ? (panelSize.width / panelSize.height).toFixed(2) : '0.00';

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>@input-kit/resize</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Drag the lower-right corner of the panel to watch the hook update live.
      </p>

      <div
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(220px, 280px)',
          alignItems: 'start',
        }}
      >
        <div
          ref={panelRef}
          style={{
            resize: 'both',
            overflow: 'auto',
            minWidth: 220,
            minHeight: 160,
            height: 240,
            borderRadius: 24,
            border: '3px solid #4f46e5',
            background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
            padding: 24,
            color: '#1e293b',
            boxShadow: '0 20px 50px rgba(79, 70, 229, 0.12)',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Resizable Panel</div>
          <div style={{ color: '#475569', lineHeight: 1.6 }}>
            Width: {Math.round(panelSize.width)}px<br />
            Height: {Math.round(panelSize.height)}px<br />
            Ratio: {ratio}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ padding: 20, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>Panel Width</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{Math.round(panelSize.width)}px</div>
          </div>
          <div style={{ padding: 20, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>Panel Height</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{Math.round(panelSize.height)}px</div>
          </div>
          <div style={{ padding: 20, borderRadius: 20, background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5', marginBottom: 8 }}>Viewport</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#312e81' }}>
              {viewport.width}px × {viewport.height}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demo;

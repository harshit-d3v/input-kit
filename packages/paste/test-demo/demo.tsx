import React, { useState } from 'react';
import { PasteZone, pasteImageToDataUrl, type PasteData } from '../src/index';

type PreviewEntry = {
  id: string;
  label: string;
  kind: 'text' | 'html' | 'file' | 'image';
  content: string;
};

async function buildEntries(data: PasteData): Promise<PreviewEntry[]> {
  const entries: PreviewEntry[] = [];

  if (data.text) {
    entries.push({
      id: 'text',
      label: 'text/plain',
      kind: 'text',
      content: data.text,
    });
  }

  if (data.html) {
    entries.push({
      id: 'html',
      label: 'text/html',
      kind: 'html',
      content: data.html,
    });
  }

  if (data.files) {
    for (const file of data.files) {
      entries.push({
        id: `file-${file.name}-${file.size}`,
        label: file.type || 'file',
        kind: 'file',
        content: `${file.name} • ${Math.max(1, Math.round(file.size / 1024))} KB`,
      });
    }
  }

  if (data.images) {
    const imageEntries = await Promise.all(
      data.images.map(async (image, index) => ({
        id: `image-${index}-${image.name}-${image.size}`,
        label: image.type || 'image',
        kind: 'image' as const,
        content: await pasteImageToDataUrl(image),
      }))
    );

    entries.push(...imageEntries);
  }

  return entries;
}

export function Demo() {
  const [entries, setEntries] = useState<PreviewEntry[]>([]);

  const handlePaste = async (data: PasteData) => {
    const nextEntries = await buildEntries(data);

    setEntries(
      nextEntries.length > 0
        ? nextEntries
        : [
            {
              id: 'empty',
              label: 'No supported clipboard data',
              kind: 'text',
              content: 'Try plain text, HTML, or image content.',
            },
          ]
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>@input-kit/paste</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Focus the zone and paste text, markup, files, or images from your clipboard.
      </p>

      <PasteZone
        onPaste={handlePaste}
        style={{
          minHeight: 220,
          padding: 32,
          borderRadius: 24,
          border: '2px dashed #94a3b8',
          background: '#f8fafc',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Paste Into This Zone</div>
          <div style={{ color: '#64748b' }}>Ctrl+V or Cmd+V supported</div>
        </div>
      </PasteZone>

      <div
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: 24,
          padding: 24,
          display: 'grid',
          gap: 16,
        }}
      >
        {entries.length === 0 ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 1rem' }}>
            Waiting for clipboard content.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', marginBottom: 10 }}>
                {entry.label}
              </div>
              {entry.kind === 'image' ? (
                <img
                  src={entry.content}
                  alt={entry.label}
                  style={{ maxWidth: '100%', borderRadius: 16, border: '1px solid #334155' }}
                />
              ) : (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  }}
                >
                  {entry.content}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Demo;

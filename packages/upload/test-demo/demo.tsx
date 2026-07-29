import React from 'react';
import { FileUpload, UploadList } from '../src/index';

export function Demo() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '48px 20px 72px',
        background:
          'radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #f5f3ff 100%)',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
        color: '#0f172a',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#7c3aed' }}>
            Input Kit Upload
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 0.96 }}>
            Drag-and-drop upload surfaces that feel like polished workspace tools, not default browser inputs.
          </h1>
          <p style={{ maxWidth: 760, margin: 0, color: '#475569', fontSize: 18, lineHeight: 1.6 }}>
            This demo keeps uploads local with `autoUpload=false`, so you can test drag state, validation, previews, queue cleanup, and the render-prop API without needing a backend.
          </p>
        </header>

        <FileUpload
          url="/demo-upload"
          accept="image/*,.pdf,.csv"
          maxFiles={5}
          maxFileSize={5 * 1024 * 1024}
          autoUpload={false}
        >
          {({ files, pendingCount, errorCount, removeFile, clearFiles, isDragActive, openFileDialog }) => (
            <section style={{ display: 'grid', gap: 20 }}>
              <div
                onClick={openFileDialog}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openFileDialog();
                  }
                }}
                role="button"
                tabIndex={0}
                style={{
                  borderRadius: 28,
                  padding: '40px 28px',
                  border: `2px dashed ${isDragActive ? '#8b5cf6' : 'rgba(148,163,184,0.35)'}`,
                  background: isDragActive
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.12))'
                    : 'rgba(255,255,255,0.82)',
                  boxShadow: isDragActive ? '0 0 0 6px rgba(168,85,247,0.12)' : '0 24px 60px rgba(15,23,42,0.08)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontSize: 28,
                    }}
                  >
                    ↑
                  </div>
                  <h2 style={{ margin: 0, fontSize: 28 }}>
                    {isDragActive ? 'Release to add files' : 'Build a review queue in one drop'}
                  </h2>
                  <p style={{ margin: 0, maxWidth: 580, color: '#475569', lineHeight: 1.6 }}>
                    Accepted: images, PDF, and CSV. Files stay in a local queue here so you can inspect previews and remove items before wiring a real upload endpoint.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Queued files', value: files.length, accent: '#2563eb' },
                  { label: 'Pending review', value: pendingCount, accent: '#8b5cf6' },
                  { label: 'Validation errors', value: errorCount, accent: '#dc2626' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#ffffff', borderRadius: 18, padding: 16, border: '1px solid rgba(148,163,184,0.18)' }}>
                    <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{stat.label}</div>
                    <div style={{ fontSize: 34, fontWeight: 700, color: stat.accent }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {files.length > 0 && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ margin: 0 }}>Queued assets</h2>
                    <button
                      onClick={clearFiles}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        padding: '10px 16px',
                        background: '#e2e8f0',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      Clear queue
                    </button>
                  </div>

                  <UploadList files={files} onRemove={removeFile} />
                </div>
              )}
            </section>
          )}
        </FileUpload>
      </div>
    </div>
  );
}

export default Demo;

import React, { useState } from 'react';
import { useDropzone, Dropzone } from '../src/index';
import type { FileWithPreview, FileRejection } from '../src/index';

const sectionStyle: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  background: '#fff',
};

const dropzoneStyle = (isDragActive: boolean, isDragAccept: boolean, isDragReject: boolean): React.CSSProperties => ({
  border: `2px dashed ${isDragReject ? '#ef4444' : isDragAccept ? '#22c55e' : isDragActive ? '#3b82f6' : '#cbd5e1'}`,
  borderRadius: '8px',
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
  background: isDragReject ? '#fef2f2' : isDragAccept ? '#f0fdf4' : isDragActive ? '#eff6ff' : '#f8fafc',
  transition: 'all 0.15s ease',
  outline: 'none',
});

// Demo 1: Basic drag-and-drop
function BasicDemo() {
  const { files, rejectedFiles, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, removeFile } =
    useDropzone({
      multiple: true,
      onDrop: (accepted, rejected) => {
        console.log('accepted', accepted);
        console.log('rejected', rejected);
      },
    });

  return (
    <div style={sectionStyle}>
      <h2>Basic Usage</h2>
      <p>Drag files here, click, or press Space / Enter to open the file dialog.</p>

      <div {...getRootProps()} style={dropzoneStyle(isDragActive, isDragAccept, isDragReject)}>
        <input {...getInputProps()} />
        {isDragReject
          ? 'Some files will be rejected'
          : isDragAccept
          ? 'Drop to upload'
          : isDragActive
          ? 'Drop here'
          : 'Drag files here, or click to select'}
      </div>

      {files.length > 0 && (
        <ul style={{ marginTop: '1rem', paddingLeft: 0, listStyle: 'none' }}>
          {files.map((f) => (
            <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{f.name} — {Math.round(f.size / 1024)} KB</span>
              <button onClick={() => removeFile(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {rejectedFiles.length > 0 && (
        <div style={{ marginTop: '1rem', color: '#ef4444' }}>
          <strong>Rejected:</strong>
          <ul style={{ paddingLeft: '1.2rem', margin: '4px 0' }}>
            {rejectedFiles.map((r, i) => (
              <li key={i}>{r.file.name} — {r.errors.map((e) => e.message).join(', ')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Demo 2: Image preview gallery
function ImagePreviewDemo() {
  const { files, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, removeFile } =
    useDropzone({
      accept: 'image/*',
      multiple: true,
    });

  return (
    <div style={sectionStyle}>
      <h2>Image Preview Gallery</h2>
      <p>Images only — previews are generated instantly from object URLs.</p>

      <div {...getRootProps()} style={dropzoneStyle(isDragActive, isDragAccept, isDragReject)}>
        <input {...getInputProps()} />
        {isDragReject ? 'Images only!' : 'Drop images here, or click to select'}
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          {files.map((f) => (
            <div key={f.id} style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={f.preview}
                alt={f.name}
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', display: 'block', border: '1px solid #e2e8f0' }}
              />
              <button
                onClick={() => removeFile(f.id)}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                  borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer',
                  fontSize: '14px', lineHeight: '20px', padding: 0, textAlign: 'center',
                }}
              >
                ×
              </button>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Demo 3: File type restriction + size limit
function RestrictedDemo() {
  const { files, rejectedFiles, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      accept: ['.pdf', '.docx', '.txt'],
      maxSize: 2 * 1024 * 1024, // 2 MB
      maxFiles: 3,
    });

  return (
    <div style={sectionStyle}>
      <h2>File Type and Size Restrictions</h2>
      <p>Accepts .pdf, .docx, .txt — max 2 MB each, up to 3 files.</p>

      <div {...getRootProps()} style={dropzoneStyle(isDragActive, isDragAccept, isDragReject)}>
        <input {...getInputProps()} />
        <div>Drop .pdf / .docx / .txt files here</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Max 2 MB · Max 3 files</div>
      </div>

      {files.length > 0 && (
        <ul style={{ marginTop: '1rem', paddingLeft: 0, listStyle: 'none' }}>
          {files.map((f) => (
            <li key={f.id} style={{ padding: '4px 0', color: '#16a34a' }}>
              {f.name} ({Math.round(f.size / 1024)} KB)
            </li>
          ))}
        </ul>
      )}

      {rejectedFiles.length > 0 && (
        <ul style={{ marginTop: '1rem', paddingLeft: 0, listStyle: 'none', color: '#ef4444' }}>
          {rejectedFiles.map((r, i) => (
            <li key={i}>{r.file.name} — {r.errors.map((e) => e.message).join(', ')}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Demo 4: Using the <Dropzone> component
function ComponentDemo() {
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  return (
    <div style={sectionStyle}>
      <h2>Dropzone Component</h2>
      <p>Declarative alternative to the hook. All styling and icons are built-in.</p>

      <Dropzone
        multiple
        onDrop={(accepted) => setDroppedFiles((prev) => [...prev, ...accepted])}
      />

      {droppedFiles.length > 0 && (
        <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem' }}>
          {droppedFiles.map((f, i) => (
            <li key={i}>{f.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>@input-kit/dropzone</h1>
      <p style={{ color: '#64748b' }}>Zero-dependency file dropzone for React. Keyboard accessible, preview support, type/size restrictions.</p>
      <BasicDemo />
      <ImagePreviewDemo />
      <RestrictedDemo />
      <ComponentDemo />
    </div>
  );
}

export default Demo;


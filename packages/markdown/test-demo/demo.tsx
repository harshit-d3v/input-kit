import React, { useState } from 'react';
import { Markdown, InlineMarkdown } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };

const STARTER = `# Heading one

Text with **bold**, *italic*, ~~struck~~ and \`inline code\`. Arithmetic like
2 * 3 * 4 stays literal rather than turning into emphasis.

## Lists

- first
- second
- third

1. one
2. two

## Table

| Package | Version | Notes |
| --- | --- | --- |
| gauge | 0.2.0 |  |
| date | 0.3.0 | grid + roving focus |

> A blockquote, which can span
> more than one line.

\`\`\`ts
const total = items.reduce((a, b) => a + b, 0);
\`\`\`

[A link](https://example.com) and an image:

![placeholder](https://example.com/img.png)

---
`;

// ─── 1. Live editor ───────────────────────────────────────────────────────────
function EditorExample() {
  const [content, setContent] = useState(STARTER);

  return (
    <div style={section}>
      <h2>Live</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={26}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '10px' }}
        />
        <div style={{ border: '1px solid #f3f4f6', borderRadius: '6px', padding: '12px', overflow: 'auto' }}>
          <Markdown content={content} />
        </div>
      </div>
    </div>
  );
}

// ─── 2. URL sanitising ────────────────────────────────────────────────────────
function SanitisingExample() {
  const cases = [
    ['https://example.com', 'allowed'],
    ['/internal/path', 'allowed — same origin'],
    ['#anchor', 'allowed'],
    ['mailto:a@example.com', 'allowed'],
    ['//evil.com', 'blocked — protocol-relative, navigates off-origin'],
    ['javascript:alert(1)', 'blocked'],
    ['data:text/html,<script>', 'blocked'],
  ];

  return (
    <div style={section}>
      <h2>Link sanitising</h2>
      <p style={note}>
        Blocked URLs render as plain text, so the label survives but the link does not.
      </p>
      <ul style={{ fontSize: '13px', lineHeight: 2 }}>
        {cases.map(([url, verdict]) => (
          <li key={url}>
            <Markdown content={`[${url}](${url})`} />
            <span style={{ color: '#6b7280' }}>{verdict}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── 3. Custom components ─────────────────────────────────────────────────────
function CustomExample() {
  return (
    <div style={section}>
      <h2>Custom renderers</h2>
      <p style={note}>Any tag can be replaced with your own component.</p>
      <Markdown
        content={'# Styled heading\n\nWith a custom paragraph too.'}
        components={{
          h1: ({ children }) => (
            <h1 style={{ color: '#6366f1', borderBottom: '2px solid #6366f1' }}>{children}</h1>
          ),
          p: ({ children }) => <p style={{ fontStyle: 'italic', color: '#374151' }}>{children}</p>,
        }}
      />
    </div>
  );
}

// ─── 4. Inline-only rendering ─────────────────────────────────────────────────
function InlineExample() {
  return (
    <div style={section}>
      <h2>InlineMarkdown</h2>
      <p style={note}>
        Renders emphasis without introducing block elements — useful inside a
        sentence: <InlineMarkdown content="a **bold** word and `some code`" />
      </p>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>@input-kit/markdown</h1>
      <p>Dependency-free Markdown renderer with URL sanitising and replaceable tags.</p>
      <EditorExample />
      <SanitisingExample />
      <CustomExample />
      <InlineExample />
    </div>
  );
}

export default Demo;

import React, { useState } from 'react';
import { CodeBlock, InlineCode, useCodeHighlight, type Language, type Theme } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };

const SAMPLES: Record<Language, string> = {
  typescript: `interface User {
  id: number;
  name: string;
}

// Blank lines below render once, not twice.

export async function load(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error('failed');
  return res.json();
}`,
  javascript: `const total = items.reduce((sum, item) => sum + item.price, 0);
console.log(\`Total: \${total}\`);`,
  json: `{
  "name": "@input-kit/code",
  "version": "0.2.0",
  "private": false
}`,
  html: `<div class="card">
  <h2>Title</h2>
  <a href="/more">Read more</a>
</div>`,
  css: `.card {
  display: flex;
  padding: 16px;
  color: #1f2937;
}`,
  python: `def fib(n: int) -> int:
    """Classic."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
  bash: `#!/usr/bin/env bash
for f in *.ts; do
  echo "checking $f"
done`,
  plaintext: `Just text.
No highlighting applied.`,
};

const LANGUAGES = Object.keys(SAMPLES) as Language[];
const THEMES: Theme[] = ['dark', 'light', 'github', 'monokai'];

// ─── 1. Language and theme matrix ─────────────────────────────────────────────
function BlockExample() {
  const [language, setLanguage] = useState<Language>('typescript');
  const [theme, setTheme] = useState<Theme>('dark');
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wrap, setWrap] = useState(false);

  return (
    <div style={section}>
      <h2>CodeBlock</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '13px' }}>
        <label>
          language{' '}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          theme{' '}
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={lineNumbers} onChange={(e) => setLineNumbers(e.target.checked)} />{' '}
          line numbers
        </label>
        <label>
          <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} /> wrap
        </label>
      </div>
      <CodeBlock
        code={SAMPLES[language]}
        language={language}
        theme={theme}
        showLineNumbers={lineNumbers}
        wrapLines={wrap}
      />
    </div>
  );
}

// ─── 2. Highlighted lines ─────────────────────────────────────────────────────
function HighlightExample() {
  return (
    <div style={section}>
      <h2>Highlighted lines</h2>
      <p style={note}>Lines 3 and 4 are called out.</p>
      <CodeBlock code={SAMPLES.javascript + '\n\nconst done = true;\nexport default done;'} language="javascript" highlightLines={[3, 4]} />
    </div>
  );
}

// ─── 3. Inline ────────────────────────────────────────────────────────────────
function InlineExample() {
  return (
    <div style={section}>
      <h2>InlineCode</h2>
      <p style={note}>
        Use <InlineCode theme="github">npm install</InlineCode> inside a sentence, or{' '}
        <InlineCode theme="dark">const x = 1</InlineCode> with the dark palette.
      </p>
    </div>
  );
}

// ─── 4. The tokenizer directly ────────────────────────────────────────────────
function TokensExample() {
  const tokens = useCodeHighlight('const x = 1; // done', 'typescript');

  return (
    <div style={section}>
      <h2>useCodeHighlight</h2>
      <p style={note}>Returns a flat token list you can render however you like.</p>
      <div style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.8 }}>
        {tokens.map((t, i) => (
          <div key={i}>
            <span style={{ color: '#6b7280' }}>{t.type}</span> →{' '}
            <span style={{ background: '#f3f4f6', padding: '1px 4px' }}>{JSON.stringify(t.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/code</h1>
      <p>Syntax-highlighted code blocks with no highlighter dependency.</p>
      <BlockExample />
      <HighlightExample />
      <InlineExample />
      <TokensExample />
    </div>
  );
}

export default Demo;

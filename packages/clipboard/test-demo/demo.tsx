/**
 * Demo/Test file for @input-kit/clipboard
 * 
 * This file demonstrates how to use the clipboard utilities
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState, useCallback } from 'react';

// SVG Icon Components (Lucide-style)
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const LinkIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
function useClipboard(options: { timeout?: number } = {}) {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState<string>('');

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setValue(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, [timeout]);

  return { copy, copied, value };
}

// Demo 1: Basic Copy
function BasicExample() {
  const { copy, copied } = useClipboard();
  const textToCopy = 'Hello, World!';

  return (
    <div>
      <h3>Basic Copy</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <code
          style={{
            padding: '10px 15px',
            background: '#f1f5f9',
            borderRadius: '6px',
            fontFamily: 'monospace',
          }}
        >
          {textToCopy}
        </code>
        <button
          onClick={() => copy(textToCopy)}
          style={{
            padding: '10px 20px',
            background: copied ? '#10b981' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {copied ? <><CheckIcon size={14} /> Copied!</> : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// Demo 2: Copy Input Value
function InputCopyExample() {
  const { copy, copied } = useClipboard();
  const [inputValue, setInputValue] = useState('Type something to copy...');

  return (
    <div>
      <h3>Copy Input Value</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
          }}
        />
        <button
          onClick={() => copy(inputValue)}
          style={{
            padding: '10px 20px',
            background: copied ? '#10b981' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? <><CheckIcon size={14} /> Copied!</> : <><CopyIcon size={14} /> Copy</>}
        </button>
      </div>
    </div>
  );
}

// Demo 3: Copy Code Snippet
function CodeSnippetExample() {
  const { copy, copied } = useClipboard();
  const codeSnippet = `const greeting = "Hello, World!";
console.log(greeting);`;

  return (
    <div>
      <h3>Copy Code Snippet</h3>
      <div
        style={{
          position: 'relative',
          background: '#1e293b',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 15px',
            background: '#334155',
            color: '#94a3b8',
            fontSize: '12px',
          }}
        >
          <span>javascript</span>
          <button
            onClick={() => copy(codeSnippet)}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? '#10b981' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {copied ? <><CheckIcon size={14} /> Copied!</> : 'Copy code'}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '15px',
            color: '#e2e8f0',
            fontSize: '14px',
            overflow: 'auto',
          }}
        >
          <code>{codeSnippet}</code>
        </pre>
      </div>
    </div>
  );
}

// Demo 4: Copy Multiple Items
function MultipleItemsExample() {
  const { copy, copied, value } = useClipboard();

  const items = [
    { label: 'Email', value: 'hello@example.com' },
    { label: 'Phone', value: '+1 (555) 123-4567' },
    { label: 'Address', value: '123 Main St, City, Country' },
    { label: 'Website', value: 'https://example.com' },
  ];

  return (
    <div>
      <h3>Copy Multiple Items</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 15px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: value === item.value && copied ? '2px solid #10b981' : '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'monospace' }}>{item.value}</div>
            </div>
            <button
              onClick={() => copy(item.value)}
              style={{
                padding: '6px 12px',
                background: value === item.value && copied ? '#10b981' : '#e2e8f0',
                color: value === item.value && copied ? '#fff' : '#1e293b',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {value === item.value && copied ? <CheckIcon size={14} /> : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Demo 5: Share Link
function ShareLinkExample() {
  const { copy, copied } = useClipboard({ timeout: 3000 });
  const shareUrl = 'https://example.com/share/abc123';

  return (
    <div>
      <h3>Share Link</h3>
      <div
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '12px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}><LinkIcon size={24} /></div>
        <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>Share this link</div>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '8px',
          }}
        >
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#fff',
              padding: '8px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => copy(shareUrl)}
            style={{
              padding: '8px 16px',
              background: copied ? '#10b981' : 'rgba(255,255,255,0.3)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
          {copied ? <><CheckIcon size={14} /> Copied!</> : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo 6: Click to Copy Text
function ClickToCopyExample() {
  const { copy, copied, value } = useClipboard();

  const texts = ['npm install @input-kit/clipboard', 'yarn add @input-kit/clipboard', 'pnpm add @input-kit/clipboard'];

  return (
    <div>
      <h3>Click to Copy</h3>
      <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        Click any command to copy it:
      </p>
      <div style={{ display: 'grid', gap: '8px' }}>
        {texts.map((text) => (
          <div
            key={text}
            onClick={() => copy(text)}
            style={{
              padding: '12px 15px',
              background: value === text && copied ? '#f0fdf4' : '#f1f5f9',
              border: value === text && copied ? '1px solid #10b981' : '1px solid transparent',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            <code>{text}</code>
            <span style={{ fontSize: '12px', color: value === text && copied ? '#10b981' : '#94a3b8' }}>
              {value === text && copied ? <><CheckIcon size={12} /> Copied</> : 'Click to copy'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/clipboard Demo</h1>
      
      <BasicExample />
      <hr style={{ margin: '30px 0' }} />
      
      <InputCopyExample />
      <hr style={{ margin: '30px 0' }} />
      
      <CodeSnippetExample />
      <hr style={{ margin: '30px 0' }} />
      
      <MultipleItemsExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ShareLinkExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ClickToCopyExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, InputCopyExample, CodeSnippetExample, MultipleItemsExample, ShareLinkExample, ClickToCopyExample };

// Default export
export default DemoApp;

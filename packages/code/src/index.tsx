// @input-kit/code - Code syntax highlighting component

import React, { useMemo, useRef, useEffect } from 'react';

// Types
export type Language = 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'python' | 'bash' | 'plaintext';
export type Theme = 'dark' | 'light' | 'github' | 'monokai';

export interface Token {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'punctuation' | 'function' | 'variable' | 'tag' | 'attribute' | 'plain';
  value: string;
}

export interface CodeBlockProps {
  code: string;
  language?: Language;
  theme?: Theme;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  wrapLines?: boolean;
  copyButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Theme definitions
const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    keyword: '#569cd6',
    string: '#ce9178',
    number: '#b5cea8',
    comment: '#6a9955',
    operator: '#d4d4d4',
    punctuation: '#d4d4d4',
    function: '#dcdcaa',
    variable: '#9cdcfe',
    tag: '#569cd6',
    attribute: '#9cdcfe',
    lineNumber: '#858585',
    lineHighlight: '#264f78',
  },
  light: {
    background: '#ffffff',
    text: '#333333',
    keyword: '#0000ff',
    string: '#a31515',
    number: '#098658',
    comment: '#008000',
    operator: '#333333',
    punctuation: '#333333',
    function: '#795e26',
    variable: '#001080',
    tag: '#800000',
    attribute: '#ff0000',
    lineNumber: '#999999',
    lineHighlight: '#ffffcc',
  },
  github: {
    background: '#f6f8fa',
    text: '#24292e',
    keyword: '#d73a49',
    string: '#032f62',
    number: '#005cc5',
    comment: '#6a737d',
    operator: '#24292e',
    punctuation: '#24292e',
    function: '#6f42c1',
    variable: '#e36209',
    tag: '#22863a',
    attribute: '#6f42c1',
    lineNumber: '#959da5',
    lineHighlight: '#fffbdd',
  },
  monokai: {
    background: '#272822',
    text: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    number: '#ae81ff',
    comment: '#75715e',
    operator: '#f8f8f2',
    punctuation: '#f8f8f2',
    function: '#a6e22e',
    variable: '#fd971f',
    tag: '#f92672',
    attribute: '#a6e22e',
    lineNumber: '#75715e',
    lineHighlight: '#3e3d32',
  },
};

// Language patterns
const PATTERNS: Record<Language, { pattern: RegExp; type: Token['type'] }[]> = {
  javascript: [
    { pattern: /\/\/.*$/gm, type: 'comment' },
    { pattern: /\/\*[\s\S]*?\*\//g, type: 'comment' },
    { pattern: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false)\b/g, type: 'keyword' },
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, type: 'string' },
    { pattern: /\b\d+\.?\d*\b/g, type: 'number' },
    { pattern: /\b([a-zA-Z_$][\w$]*)\s*\(/g, type: 'function' },
    { pattern: /[+\-*/%=<>!&|^~?:]+/g, type: 'operator' },
    { pattern: /[{}[\]();,]/g, type: 'punctuation' },
  ],
  typescript: [
    { pattern: /\/\/.*$/gm, type: 'comment' },
    { pattern: /\/\*[\s\S]*?\*\//g, type: 'comment' },
    { pattern: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false|type|interface|enum|namespace|abstract|implements|private|protected|public|readonly|static|as|is|keyof|infer|never|unknown|any|void|string|number|boolean|object|symbol|bigint)\b/g, type: 'keyword' },
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, type: 'string' },
    { pattern: /\b\d+\.?\d*\b/g, type: 'number' },
    { pattern: /\b([a-zA-Z_$][\w$]*)\s*\(/g, type: 'function' },
    { pattern: /[+\-*/%=<>!&|^~?:]+/g, type: 'operator' },
    { pattern: /[{}[\]();,]/g, type: 'punctuation' },
  ],
  json: [
    { pattern: /"(?:[^"\\]|\\.)*"/g, type: 'string' },
    { pattern: /\b(true|false|null)\b/g, type: 'keyword' },
    { pattern: /-?\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/g, type: 'number' },
    { pattern: /[{}[\]:,]/g, type: 'punctuation' },
  ],
  html: [
    { pattern: /<!--[\s\S]*?-->/g, type: 'comment' },
    { pattern: /<\/?[\w-]+/g, type: 'tag' },
    { pattern: /[\w-]+(?==)/g, type: 'attribute' },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, type: 'string' },
    { pattern: /[<>\/=]/g, type: 'punctuation' },
  ],
  css: [
    { pattern: /\/\*[\s\S]*?\*\//g, type: 'comment' },
    { pattern: /[.#]?[\w-]+(?=\s*\{)/g, type: 'function' },
    { pattern: /[\w-]+(?=\s*:)/g, type: 'attribute' },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, type: 'string' },
    { pattern: /#[\da-fA-F]{3,8}\b/g, type: 'number' },
    { pattern: /\b\d+\.?\d*(px|em|rem|%|vh|vw|deg|s|ms)?\b/g, type: 'number' },
    { pattern: /[{}:;,]/g, type: 'punctuation' },
  ],
  python: [
    { pattern: /#.*$/gm, type: 'comment' },
    { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, type: 'string' },
    { pattern: /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|raise|pass|break|continue|and|or|not|in|is|lambda|True|False|None|self|global|nonlocal|async|await)\b/g, type: 'keyword' },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, type: 'string' },
    { pattern: /\b\d+\.?\d*\b/g, type: 'number' },
    { pattern: /\b([a-zA-Z_]\w*)\s*\(/g, type: 'function' },
    { pattern: /[+\-*/%=<>!&|^~@]+/g, type: 'operator' },
    { pattern: /[{}[\]():,]/g, type: 'punctuation' },
  ],
  bash: [
    { pattern: /#.*$/gm, type: 'comment' },
    { pattern: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|echo|cd|ls|rm|cp|mv|mkdir|chmod|chown|grep|sed|awk|cat|export|source|alias)\b/g, type: 'keyword' },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, type: 'string' },
    { pattern: /\$[\w{][^}\s]*/g, type: 'variable' },
    { pattern: /[|&;<>]+/g, type: 'operator' },
  ],
  plaintext: [],
};

// Tokenizer
function tokenize(code: string, language: Language): Token[] {
  const patterns = PATTERNS[language] || [];
  
  if (patterns.length === 0) {
    return [{ type: 'plain', value: code }];
  }
  
  // Create a combined pattern
  const tokens: { index: number; length: number; type: Token['type']; value: string }[] = [];
  
  patterns.forEach(({ pattern, type }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(code)) !== null) {
      // For function pattern, capture group 1 if it exists
      const value = match[1] || match[0];
      const index = match[1] ? match.index + match[0].indexOf(match[1]) : match.index;
      tokens.push({ index, length: value.length, type, value });
    }
  });
  
  // Sort by index
  tokens.sort((a, b) => a.index - b.index);
  
  // Remove overlapping tokens (keep first)
  const filtered: typeof tokens = [];
  let lastEnd = 0;
  
  for (const token of tokens) {
    if (token.index >= lastEnd) {
      filtered.push(token);
      lastEnd = token.index + token.length;
    }
  }
  
  // Build final token list with plain text gaps
  const result: Token[] = [];
  let pos = 0;
  
  for (const token of filtered) {
    if (token.index > pos) {
      result.push({ type: 'plain', value: code.slice(pos, token.index) });
    }
    result.push({ type: token.type, value: token.value });
    pos = token.index + token.length;
  }
  
  if (pos < code.length) {
    result.push({ type: 'plain', value: code.slice(pos) });
  }
  
  return result;
}

// Hook for code highlighting
export function useCodeHighlight(code: string, language: Language = 'plaintext'): Token[] {
  return useMemo(() => tokenize(code, language), [code, language]);
}

// CodeBlock Component
export function CodeBlock({
  code,
  language = 'plaintext',
  theme = 'dark',
  showLineNumbers = true,
  highlightLines = [],
  wrapLines = false,
  copyButton = true,
  className,
  style,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokens = useCodeHighlight(code, language);
  const colors = THEMES[theme];
  // Memoize lines so tokensByLine isn't invalidated on every render.
  const lines = useMemo(() => code.split('\n'), [code]);

  // Cancel the pending reset timer on unmount to avoid updating unmounted state.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard write failed (e.g. permissions denied) — no-op.
    }
  };

  // Group tokens by line
  const tokensByLine = useMemo(() => {
    const result: Token[][] = lines.map(() => []);
    let lineIndex = 0;

    for (const token of tokens) {
      const tokenLines = token.value.split('\n');

      tokenLines.forEach((line, i) => {
        if (i > 0) {
          lineIndex++;
        }
        if (line && lineIndex < result.length) {
          result[lineIndex].push({ type: token.type, value: line });
        }
      });
    }

    return result;
  }, [tokens, lines]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: colors.background,
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        ...style,
      }}
    >
      {copyButton && (
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '4px',
            color: colors.text,
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
      
      <pre
        style={{
          margin: 0,
          padding: '16px',
          overflow: 'auto',
          whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
          wordBreak: wrapLines ? 'break-all' : 'normal',
        }}
      >
        <code>
          {tokensByLine.map((lineTokens, lineIndex) => {
            const isHighlighted = highlightLines.includes(lineIndex + 1);
            
            return (
              <div
                key={lineIndex}
                style={{
                  display: 'flex',
                  // Each line is already its own block, so it needs a height of its
                  // own when empty. It used to render a literal '\n' inside the
                  // <pre>, which showed every blank line as two.
                  minHeight: '1.5em',
                  background: isHighlighted ? colors.lineHighlight : 'transparent',
                  marginLeft: showLineNumbers ? 0 : undefined,
                  paddingLeft: isHighlighted ? '8px' : undefined,
                  marginRight: isHighlighted ? '-8px' : undefined,
                }}
              >
                {showLineNumbers && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '40px',
                      textAlign: 'right',
                      paddingRight: '16px',
                      color: colors.lineNumber,
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {lineIndex + 1}
                  </span>
                )}
                <span style={{ flex: 1 }}>
                  {lineTokens.length === 0 ? null : (
                    lineTokens.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        style={{ color: colors[token.type] || colors.text }}
                      >
                        {token.value}
                      </span>
                    ))
                  )}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

// Inline Code Component
export function InlineCode({
  children,
  theme = 'dark',
  className,
  style,
}: {
  children: string;
  theme?: Theme;
  className?: string;
  style?: React.CSSProperties;
}) {
  const colors = THEMES[theme];
  
  return (
    <code
      className={className}
      style={{
        background: colors.background,
        color: colors.text,
        padding: '2px 6px',
        borderRadius: '4px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.9em',
        ...style,
      }}
    >
      {children}
    </code>
  );
}

// Export theme colors for external use
export { THEMES };

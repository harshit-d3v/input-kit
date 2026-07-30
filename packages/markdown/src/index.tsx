// @input-kit/markdown - Markdown renderer component

import React, { useMemo, ReactNode } from 'react';

// Types
export interface MarkdownProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  components?: Partial<MarkdownComponents>;
}

export interface MarkdownComponents {
  h1: React.ComponentType<{ children: ReactNode }>;
  h2: React.ComponentType<{ children: ReactNode }>;
  h3: React.ComponentType<{ children: ReactNode }>;
  h4: React.ComponentType<{ children: ReactNode }>;
  h5: React.ComponentType<{ children: ReactNode }>;
  h6: React.ComponentType<{ children: ReactNode }>;
  p: React.ComponentType<{ children: ReactNode }>;
  a: React.ComponentType<{ href?: string; children: ReactNode }>;
  img: React.ComponentType<{ src?: string; alt?: string }>;
  code: React.ComponentType<{ inline?: boolean; language?: string; children: ReactNode }>;
  pre: React.ComponentType<{ children: ReactNode }>;
  blockquote: React.ComponentType<{ children: ReactNode }>;
  ul: React.ComponentType<{ children: ReactNode }>;
  ol: React.ComponentType<{ children: ReactNode }>;
  li: React.ComponentType<{ children: ReactNode }>;
  hr: React.ComponentType<{}>;
  strong: React.ComponentType<{ children: ReactNode }>;
  em: React.ComponentType<{ children: ReactNode }>;
  del: React.ComponentType<{ children: ReactNode }>;
  table: React.ComponentType<{ children: ReactNode }>;
  thead: React.ComponentType<{ children: ReactNode }>;
  tbody: React.ComponentType<{ children: ReactNode }>;
  tr: React.ComponentType<{ children: ReactNode }>;
  th: React.ComponentType<{ children: ReactNode }>;
  td: React.ComponentType<{ children: ReactNode }>;
}

interface Token {
  type: string;
  content?: string;
  children?: Token[];
  props?: Record<string, unknown>;
}

function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Protocol-relative URLs (`//evil.com`, and the backslash form browsers also
  // accept) navigate off-origin. They have to be rejected up front: excluding them
  // from the internal-path branch below is not enough, because `new URL` resolves
  // them against the base into a perfectly valid `https:` URL, which the
  // absolute-URL branch would then approve.
  if (/^[/\\]{2}/.test(trimmed)) return undefined;

  // Genuinely same-origin references.
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, 'https://input-kit.dev');
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:') {
      return trimmed;
    }
  } catch {
  }

  return undefined;
}

// Default components
const defaultComponents: MarkdownComponents = {
  h1: ({ children }) => <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: '0.67em 0' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.83em 0' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '1.17em', fontWeight: 'bold', margin: '1em 0' }}>{children}</h3>,
  h4: ({ children }) => <h4 style={{ fontSize: '1em', fontWeight: 'bold', margin: '1.33em 0' }}>{children}</h4>,
  h5: ({ children }) => <h5 style={{ fontSize: '0.83em', fontWeight: 'bold', margin: '1.67em 0' }}>{children}</h5>,
  h6: ({ children }) => <h6 style={{ fontSize: '0.67em', fontWeight: 'bold', margin: '2.33em 0' }}>{children}</h6>,
  p: ({ children }) => <p style={{ margin: '1em 0' }}>{children}</p>,
  a: ({ href, children }) => {
    const safeHref = sanitizeUrl(href);

    if (!safeHref) {
      return <span>{children}</span>;
    }

    return <a href={safeHref} style={{ color: '#3b82f6', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{children}</a>;
  },
  img: ({ src, alt }) => {
    const safeSrc = sanitizeUrl(src);

    if (!safeSrc) {
      return alt ? <span>{alt}</span> : null;
    }

    return <img src={safeSrc} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />;
  },
  code: ({ inline, children }) => inline 
    ? <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code>
    : <code style={{ display: 'block', fontFamily: 'monospace' }}>{children}</code>,
  pre: ({ children }) => <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '16px', borderRadius: '8px', overflow: 'auto', margin: '1em 0' }}>{children}</pre>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid #d1d5db', paddingLeft: '16px', margin: '1em 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
  ul: ({ children }) => <ul style={{ margin: '1em 0', paddingLeft: '2em' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '1em 0', paddingLeft: '2em' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '0.5em 0' }}>{children}</li>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #d1d5db', margin: '2em 0' }} />,
  strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  del: ({ children }) => <del style={{ textDecoration: 'line-through' }}>{children}</del>,
  table: ({ children }) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '1em 0' }}>{children}</table>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', background: '#f9fafb' }}>{children}</th>,
  td: ({ children }) => <td style={{ border: '1px solid #d1d5db', padding: '8px 12px' }}>{children}</td>,
};

// Parser
function parseInline(text: string): Token[] {
  const tokens: Token[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    let matched = false;
    
    // Bold **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      tokens.push({ type: 'strong', children: parseInline(boldMatch[2]) });
      remaining = remaining.slice(boldMatch[0].length);
      matched = true;
      continue;
    }
    
    // Italic *text* or _text_.
    // CommonMark requires the opening delimiter to be followed by a non-space, so
    // that arithmetic like `2 * 3 * 4` is not rendered as an emphasis run.
    const italicMatch = remaining.match(/^(\*|_)(\S(?:.*?\S)?)\1/);
    if (italicMatch) {
      tokens.push({ type: 'em', children: parseInline(italicMatch[2]) });
      remaining = remaining.slice(italicMatch[0].length);
      matched = true;
      continue;
    }
    
    // Strikethrough ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      tokens.push({ type: 'del', children: parseInline(strikeMatch[1]) });
      remaining = remaining.slice(strikeMatch[0].length);
      matched = true;
      continue;
    }
    
    // Inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push({ type: 'code', content: codeMatch[1], props: { inline: true } });
      remaining = remaining.slice(codeMatch[0].length);
      matched = true;
      continue;
    }
    
    // Links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push({ type: 'a', children: parseInline(linkMatch[1]), props: { href: linkMatch[2] } });
      remaining = remaining.slice(linkMatch[0].length);
      matched = true;
      continue;
    }
    
    // Images ![alt](src)
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      tokens.push({ type: 'img', props: { alt: imgMatch[1], src: imgMatch[2] } });
      remaining = remaining.slice(imgMatch[0].length);
      matched = true;
      continue;
    }
    
    // Plain text (until next special character or end)
    if (!matched) {
      const nextSpecial = remaining.search(/[\*_`\[!~]/);
      if (nextSpecial === -1) {
        tokens.push({ type: 'text', content: remaining });
        remaining = '';
      } else if (nextSpecial === 0) {
        tokens.push({ type: 'text', content: remaining[0] });
        remaining = remaining.slice(1);
      } else {
        tokens.push({ type: 'text', content: remaining.slice(0, nextSpecial) });
        remaining = remaining.slice(nextSpecial);
      }
    }
  }
  
  return tokens;
}

function parseMarkdown(content: string): Token[] {
  const lines = content.split('\n');
  const tokens: Token[] = [];
  let i = 0;
  const tableSeparatorPattern = /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }
    
    // Code block ```
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({
        type: 'pre',
        children: [{
          type: 'code',
          content: codeLines.join('\n'),
          props: { language },
        }],
      });
      i++;
      continue;
    }
    
    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      tokens.push({
        type: `h${level}`,
        children: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }
    
    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }
    
    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      tokens.push({
        type: 'blockquote',
        children: parseMarkdown(quoteLines.join('\n')),
      });
      continue;
    }
    
    // Unordered list
    if (/^[\*\-\+]\s/.test(line)) {
      const listItems: Token[] = [];
      while (i < lines.length && /^[\*\-\+]\s/.test(lines[i])) {
        listItems.push({
          type: 'li',
          children: parseInline(lines[i].replace(/^[\*\-\+]\s/, '')),
        });
        i++;
      }
      tokens.push({ type: 'ul', children: listItems });
      continue;
    }
    
    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: Token[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push({
          type: 'li',
          children: parseInline(lines[i].replace(/^\d+\.\s/, '')),
        });
        i++;
      }
      tokens.push({ type: 'ol', children: listItems });
      continue;
    }
    
    // Table
    if (line.includes('|') && i + 1 < lines.length && tableSeparatorPattern.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      if (tableLines.length >= 2) {
        // Strip only the empty cells produced by leading/trailing pipes. The previous
        // `.filter(Boolean)` also deleted genuinely empty cells, so `| a |  | c |`
        // collapsed to two columns and shifted `c` under the second heading.
        const splitRow = (row: string): string[] => {
          const cells = row.split('|').map(c => c.trim());
          if (cells.length > 0 && cells[0] === '') cells.shift();
          if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
          return cells;
        };

        const headerCells = splitRow(tableLines[0]);
        const bodyRows = tableLines.slice(2).map(splitRow);


        tokens.push({
          type: 'table',
          children: [
            {
              type: 'thead',
              children: [{
                type: 'tr',
                children: headerCells.map(cell => ({
                  type: 'th',
                  children: parseInline(cell),
                })),
              }],
            },
            {
              type: 'tbody',
              children: bodyRows.map(row => ({
                type: 'tr',
                children: row.map(cell => ({
                  type: 'td',
                  children: parseInline(cell),
                })),
              })),
            },
          ],
        });
      }
      continue;
    }
    
    // Paragraph
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && 
           !lines[i].startsWith('#') && 
           !lines[i].startsWith('>') &&
           !lines[i].startsWith('```') &&
           !/^[\*\-\+]\s/.test(lines[i]) &&
           !/^\d+\.\s/.test(lines[i]) &&
           !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())) {
      paragraphLines.push(lines[i]);
      i++;
    }
    
    if (paragraphLines.length > 0) {
      tokens.push({
        type: 'p',
        children: parseInline(paragraphLines.join(' ')),
      });
    }
  }
  
  return tokens;
}

// Renderer
function renderTokens(
  tokens: Token[],
  components: MarkdownComponents,
  key: string = ''
): ReactNode[] {
  return tokens.map((token, index) => {
    const tokenKey = `${key}-${index}`;
    
    if (token.type === 'text') {
      return token.content;
    }
    
    const Component = components[token.type as keyof MarkdownComponents];
    if (!Component) {
      return null;
    }
    
    const children = token.children 
      ? renderTokens(token.children, components, tokenKey)
      : token.content;
    
    return (
      <Component key={tokenKey} {...(token.props as Record<string, unknown> | undefined)}>
        {children}
      </Component>
    );
  });
}

// Hook
export function useMarkdown(content: string): Token[] {
  return useMemo(() => parseMarkdown(content), [content]);
}

// Component
export function Markdown({
  content,
  className,
  style,
  components: customComponents = {},
}: MarkdownProps) {
  const tokens = useMarkdown(content);
  // Memoised on the override object. Rebuilding this every render gave React a new
  // element *type* for each overridden tag, which unmounted and remounted that part
  // of the document — discarding any state inside a custom component.
  const mergedComponents = useMemo(
    () => ({ ...defaultComponents, ...customComponents }),
    [customComponents]
  );

  return (
    <div className={className} style={style}>
      {renderTokens(tokens, mergedComponents)}
    </div>
  );
}

// Inline Markdown (single paragraph, no block elements)
export function InlineMarkdown({
  content,
  className,
  style,
  components: customComponents = {},
}: MarkdownProps) {
  const tokens = useMemo(() => parseInline(content), [content]);
  const mergedComponents = useMemo(
    () => ({ ...defaultComponents, ...customComponents }),
    [customComponents]
  );

  return (
    <span className={className} style={style}>
      {renderTokens(tokens, mergedComponents)}
    </span>
  );
}

// Export parser for external use
export { parseMarkdown, parseInline };

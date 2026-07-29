# @input-kit/markdown

Lightweight React markdown renderer with custom components, inline parsing helpers, tables, lists, blockquotes, code blocks, and safe URL handling.

## Installation

```bash
npm install @input-kit/markdown
```

## Quick Start

```tsx
import { Markdown, InlineMarkdown } from '@input-kit/markdown';

function Example() {
	return (
		<>
			<Markdown content={`# Hello\n\nVisit [Input Kit](https://example.com)`} />
			<InlineMarkdown content="Use **bold** text inside a sentence." />
		</>
	);
}
```

## Components

### `Markdown`

Renders block-level markdown.

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Markdown source |
| `className` | `string` | Optional wrapper class |
| `style` | `React.CSSProperties` | Optional wrapper styles |
| `components` | `Partial<MarkdownComponents>` | Override rendered elements |

### `InlineMarkdown`

Renders inline markdown without block parsing.

It accepts the same props as `Markdown`.

## Hooks and utilities

### `useMarkdown(content)`

Returns parsed block tokens for memoized custom rendering.

### `parseMarkdown(content)`

Parses markdown into token objects.

### `parseInline(content)`

Parses inline markdown such as bold, italics, links, images, and code spans.

## Supported syntax

- Headings: `#` through `######`
- Paragraphs
- Bold, italic, strikethrough
- Inline code and fenced code blocks
- Blockquotes
- Ordered and unordered lists
- Tables with a separator row
- Links and images
- Horizontal rules

## Security notes

- Links and images are sanitized to allow only `http`, `https`, `mailto`, `tel`, relative paths, and hash links.
- Raw HTML is not executed by the renderer.

## License

MIT © Input Kit

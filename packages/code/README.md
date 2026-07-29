# @input-kit/code

Headless syntax-highlighting components and hooks for React — no external tokenizer dependency. Supports 8 languages and 4 built-in themes with line numbers, line highlighting, and a built-in copy button.

## Installation

```bash
npm install @input-kit/code
```

## Usage

### `CodeBlock` component

Renders a full code block with syntax highlighting, optional line numbers, line highlighting, and a copy button.

```tsx
import { CodeBlock } from '@input-kit/code';

function Example() {
  const code = `const greeting = "Hello, world!";\nconsole.log(greeting);`;

  return (
    <CodeBlock
      code={code}
      language="javascript"
      theme="dark"
      showLineNumbers
      copyButton
    />
  );
}
```

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | Source code to display *(required)* |
| `language` | `Language` | `'plaintext'` | Language for syntax highlighting |
| `theme` | `Theme` | `'dark'` | Color theme |
| `showLineNumbers` | `boolean` | `true` | Show line number gutter |
| `highlightLines` | `number[]` | `[]` | 1-based line numbers to highlight |
| `wrapLines` | `boolean` | `false` | Wrap long lines instead of scrolling |
| `copyButton` | `boolean` | `true` | Show a copy-to-clipboard button |
| `className` | `string` | — | Extra CSS class on the wrapper |
| `style` | `CSSProperties` | — | Inline styles on the wrapper |

---

### `InlineCode` component

Renders a styled inline `<code>` span.

```tsx
import { InlineCode } from '@input-kit/code';

<p>Call <InlineCode theme="github">useState()</InlineCode> at the top of your component.</p>
```

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | — | Text to display *(required)* |
| `theme` | `Theme` | `'dark'` | Color theme |
| `className` | `string` | — | Extra CSS class |
| `style` | `CSSProperties` | — | Inline styles |

---

### `useCodeHighlight` hook

Returns a `Token[]` array for custom rendering — useful when you need full control over the markup.

```tsx
import { useCodeHighlight } from '@input-kit/code';

function CustomBlock({ code }: { code: string }) {
  const tokens = useCodeHighlight(code, 'typescript');
  return (
    <pre>
      <code>
        {tokens.map((token, i) => (
          <span key={i} data-type={token.type}>{token.value}</span>
        ))}
      </code>
    </pre>
  );
}
```

**Returns** `Token[]` — each token has `type` and `value`.

---

## Supported languages

`javascript` · `typescript` · `json` · `html` · `css` · `python` · `bash` · `plaintext`

## Supported themes

| Name | Description |
|------|-------------|
| `dark` | VS Code Dark+ |
| `light` | VS Code Light |
| `github` | GitHub |
| `monokai` | Monokai |

You can also import the `THEMES` object directly to access raw color values.

```ts
import { THEMES } from '@input-kit/code';
const bg = THEMES.monokai.background; // '#272822'
```

## Peer dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19

## License

MIT © Input Kit

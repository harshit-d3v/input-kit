# @input-kit/command

Headless command palette component and hooks for React — fuzzy search, keyboard navigation, grouped commands, and a global `Cmd/Ctrl+K` shortcut out of the box.

## Installation

```bash
npm install @input-kit/command
```

## Quick Start

```tsx
import { CommandPalette, useCommandPalette } from '@input-kit/command';
import { useState } from 'react';

const commands = [
  {
    id: 'docs',
    label: 'Search Docs',
    group: 'Suggestions',
    shortcut: '⌘S',
    onSelect: () => window.open('/docs'),
  },
  {
    id: 'settings',
    label: 'Settings',
    group: 'Account',
    shortcut: '⌘,',
    onSelect: () => router.push('/settings'),
  },
];

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open palette</button>
      <CommandPalette
        commands={commands}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

> The global `Cmd/Ctrl+K` shortcut is registered automatically by `useCommandPalette`.

## API Reference

### `CommandPalette` component

Pre-built palette UI rendered into a portal at `document.body`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `commands` | `Command[]` | — | Commands to display *(required)* |
| `isOpen` | `boolean` | — | Controls visibility *(required)* |
| `onClose` | `() => void` | — | Called when the palette should close *(required)* |
| `placeholder` | `string` | `'Type a command or search...'` | Input placeholder |
| `emptyMessage` | `string` | `'No results found.'` | Message when no commands match |
| `className` | `string` | — | Extra CSS class on the backdrop wrapper |
| `style` | `CSSProperties` | — | Inline styles on the backdrop wrapper |

---

### `useCommandPalette` hook

Headless hook for custom palette UIs.

```tsx
import { useCommandPalette } from '@input-kit/command';

function CustomPalette({ commands }) {
  const {
    isOpen, open, close, toggle,
    query, setQuery,
    filteredCommands,
    selectedIndex,
    selectNext, selectPrevious,
    executeSelected,
    handleKeyDown,
  } = useCommandPalette({ commands, onSelect: (cmd) => console.log(cmd) });

  if (!isOpen) return null;

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} />
      <ul>
        {filteredCommands.map((cmd, i) => (
          <li key={cmd.id} aria-selected={i === selectedIndex} onClick={() => { cmd.onSelect(); close(); }}>
            {cmd.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Options**

| Option | Type | Description |
|--------|------|-------------|
| `commands` | `Command[]` | Commands to search through |
| `onSelect` | `(command: Command) => void` | Called after a command executes |

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Whether the palette is open |
| `open` | `() => void` | Open the palette |
| `close` | `() => void` | Close the palette and reset query |
| `toggle` | `() => void` | Toggle open/closed |
| `query` | `string` | Current search query |
| `setQuery` | `(q: string) => void` | Update search query |
| `filteredCommands` | `Command[]` | Commands matching the current query |
| `selectedIndex` | `number` | Index of the highlighted command |
| `setSelectedIndex` | `(i: number) => void` | Set highlighted index |
| `selectNext` | `() => void` | Move highlight down |
| `selectPrevious` | `() => void` | Move highlight up |
| `executeSelected` | `() => void` | Run the highlighted command |
| `handleKeyDown` | `(e: KeyboardEvent) => void` | Spread onto your input element |

---

### `CommandProvider` + `useRegisterCommand`

Register commands from anywhere in the tree without prop-drilling.

```tsx
import { CommandProvider, useRegisterCommand, useCommandPalette } from '@input-kit/command';
import { useMemo } from 'react';

// Wrap your app
function App() {
  return (
    <CommandProvider>
      <Main />
    </CommandProvider>
  );
}

// Register a command from a nested component
function SaveButton() {
  // Memoize the command object to avoid re-registration on every render.
  const command = useMemo(() => ({
    id: 'save',
    label: 'Save',
    shortcut: '⌘S',
    onSelect: () => handleSave(),
  }), []);

  useRegisterCommand(command);
  return <button>Save</button>;
}
```

**`useCommands()`** — returns `{ commands, registerCommand, unregisterCommand }` from the nearest `CommandProvider`.

---

### `Command` type

```ts
interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  keywords?: string[];    // Extra words matched by fuzzy search
  disabled?: boolean;
  onSelect: () => void;
}
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open palette (global, registered automatically) |
| `ArrowDown` | Move selection down |
| `ArrowUp` | Move selection up |
| `Enter` | Execute selected command |
| `Escape` | Close palette / clear input |

## Search

Commands are filtered using a **fuzzy match** across `label`, `description`, and `keywords`. Query characters must appear in order but need not be consecutive.

## Peer dependencies

- `react` ^18 or ^19
- `react-dom` ^18 or ^19

## License

MIT © Input Kit

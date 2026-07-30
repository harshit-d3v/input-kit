import React, { useMemo, useState } from 'react';
import { CommandPalette, useCommandPalette, type Command } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };
const mono: React.CSSProperties = {
  fontFamily: 'monospace',
  background: '#f3f4f6',
  padding: '2px 6px',
  borderRadius: '4px',
};

const useCommands = (run: (label: string) => void): Command[] =>
  useMemo(
    () => [
      { id: 'new', label: 'New file', shortcut: '⌘N', group: 'File', onSelect: () => run('New file') },
      { id: 'open', label: 'Open file', shortcut: '⌘O', group: 'File', onSelect: () => run('Open file') },
      { id: 'save', label: 'Save', shortcut: '⌘S', group: 'File', onSelect: () => run('Save') },
      {
        id: 'find',
        label: 'Find in files',
        shortcut: '⌘⇧F',
        group: 'Edit',
        keywords: ['search', 'grep'],
        onSelect: () => run('Find in files'),
      },
      { id: 'replace', label: 'Replace', group: 'Edit', onSelect: () => run('Replace') },
      { id: 'theme', label: 'Toggle theme', group: 'View', onSelect: () => run('Toggle theme') },
      { id: 'sidebar', label: 'Toggle sidebar', group: 'View', onSelect: () => run('Toggle sidebar') },
      { id: 'terminal', label: 'Open terminal', group: 'View', onSelect: () => run('Open terminal') },
      { id: 'legacy', label: 'Deprecated action', group: 'Other', disabled: true, onSelect: () => run('never') },
    ],
    [run]
  );

// ─── 1. The palette component ─────────────────────────────────────────────────
function PaletteExample() {
  const [last, setLast] = useState('(nothing yet)');
  const [open, setOpen] = useState(false);
  const commands = useCommands(setLast);

  return (
    <div style={section}>
      <h2>Command palette</h2>
      <p style={note}>
        Press <span style={mono}>⌘K</span> / <span style={mono}>Ctrl+K</span>, or use the
        button. Type to filter, arrow keys to move, Enter to run, Escape to dismiss.
      </p>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Open palette
      </button>
      <p style={note}>
        Last command: <span style={mono}>{last}</span>
      </p>
      <CommandPalette
        commands={commands}
        isOpen={open}
        onClose={() => setOpen(false)}
        placeholder="Type a command…"
        emptyMessage="Nothing matches."
      />
    </div>
  );
}

// ─── 2. Driving the hook directly ─────────────────────────────────────────────
function FilteringExample() {
  const [last, setLast] = useState('(nothing yet)');
  const commands = useCommands(setLast);
  const palette = useCommandPalette({ commands, onSelect: (c) => setLast(c.label) });

  return (
    <div style={section}>
      <h2>useCommandPalette</h2>
      <p style={note}>
        The highlight resets whenever the result <em>set</em> changes, not merely when
        its length does — so filtering from one five-result set to a different one
        cannot leave the selection pointing at something that is no longer there. Try{' '}
        <span style={mono}>search</span>, which matches on keywords rather than label.
      </p>
      <input
        value={palette.query}
        onChange={(e) => palette.setQuery(e.target.value)}
        onKeyDown={palette.handleKeyDown}
        placeholder="Filter commands…"
        style={{ padding: '8px 12px', fontSize: '15px', width: '100%', maxWidth: '360px' }}
      />
      <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0, fontSize: '14px' }}>
        {palette.filteredCommands.map((c, i) => (
          <li
            key={c.id}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              opacity: c.disabled ? 0.45 : 1,
              background: i === palette.selectedIndex ? '#eef2ff' : 'transparent',
            }}
          >
            <span>
              {c.label}
              {c.group ? <span style={{ ...note, marginLeft: '8px' }}>{c.group}</span> : null}
            </span>
            {c.shortcut ? <span style={note}>{c.shortcut}</span> : null}
          </li>
        ))}
        {palette.filteredCommands.length === 0 && <li style={note}>No matches.</li>}
      </ul>
      <p style={note}>
        Showing <span style={mono}>{palette.filteredCommands.length}</span> of{' '}
        <span style={mono}>{commands.length}</span> · selected index{' '}
        <span style={mono}>{palette.selectedIndex}</span> · last{' '}
        <span style={mono}>{last}</span>
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={palette.selectPrevious} style={{ cursor: 'pointer' }}>Previous</button>
        <button onClick={palette.selectNext} style={{ cursor: 'pointer' }}>Next</button>
        <button onClick={palette.executeSelected} style={{ cursor: 'pointer' }}>Run selected</button>
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/command</h1>
      <p>Searchable command palette with grouping, shortcuts and keyboard navigation.</p>
      <PaletteExample />
      <FilteringExample />
    </div>
  );
}

export default Demo;

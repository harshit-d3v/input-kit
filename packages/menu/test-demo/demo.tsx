import React, { useState } from 'react';
import { ContextMenu, DropdownMenu, menuItem, menuSeparator, type MenuItem } from '../src/index';

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

const useLog = () => {
  const [last, setLast] = useState<string>('(nothing yet)');
  return { last, pick: (label: string) => () => setLast(label) };
};

// ─── 1. Right-click menu ──────────────────────────────────────────────────────
function ContextExample() {
  const { last, pick } = useLog();

  const items: MenuItem[] = [
    menuItem('cut', 'Cut', { shortcut: '⌘X', onClick: pick('Cut') }),
    menuItem('copy', 'Copy', { shortcut: '⌘C', onClick: pick('Copy') }),
    menuItem('paste', 'Paste', { shortcut: '⌘V', disabled: true }),
    menuSeparator(),
    menuItem('delete', 'Delete', { danger: true, onClick: pick('Delete') }),
  ];

  return (
    <div style={section}>
      <h2>Context menu</h2>
      <ContextMenu items={items}>
        <div
          style={{
            padding: '3rem',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          Right-click anywhere in this box
        </div>
      </ContextMenu>
      <p style={note}>
        Last action: <span style={mono}>{last}</span>
      </p>
      <p style={note}>
        Focus moves into the menu on open, so arrow keys, Home/End and Enter all work,
        and Escape or a click outside dismisses it.
      </p>
    </div>
  );
}

// ─── 2. Dropdown, including a submenu ─────────────────────────────────────────
function DropdownExample() {
  const { last, pick } = useLog();

  const items: MenuItem[] = [
    menuItem('new', 'New file', { shortcut: '⌘N', onClick: pick('New file') }),
    menuItem('open', 'Open…', { onClick: pick('Open') }),
    menuSeparator(),
    menuItem('export', 'Export as', {
      children: [
        menuItem('png', 'PNG', { onClick: pick('Export PNG') }),
        menuItem('svg', 'SVG', { onClick: pick('Export SVG') }),
        menuItem('pdf', 'PDF', { onClick: pick('Export PDF') }),
      ],
    }),
    menuSeparator(),
    menuItem('quit', 'Quit', { danger: true, onClick: pick('Quit') }),
  ];

  return (
    <div style={section}>
      <h2>Dropdown menu</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {(['start', 'center', 'end'] as const).map((align) => (
          <DropdownMenu
            key={align}
            items={items}
            align={align}
            trigger={
              <span
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                }}
              >
                align={align}
              </span>
            }
          />
        ))}
      </div>
      <p style={note}>
        Last action: <span style={mono}>{last}</span>
      </p>
      <p style={note}>
        Open one and press <kbd>→</kbd> on &ldquo;Export as&rdquo; to enter the submenu,
        then <kbd>←</kbd> to come back — focus returns to the parent item it came from.
      </p>
    </div>
  );
}

// ─── 3. Disabled entries stay discoverable ────────────────────────────────────
function DisabledExample() {
  const items: MenuItem[] = [
    menuItem('a', 'Available'),
    menuItem('b', 'Unavailable', { disabled: true }),
    menuItem('c', 'Also available'),
  ];

  return (
    <div style={section}>
      <h2>Disabled entries</h2>
      <p style={note}>
        Disabled items carry <code>aria-disabled</code> rather than being skipped, so a
        screen-reader user can still discover that the option exists.
      </p>
      <DropdownMenu
        items={items}
        trigger={
          <span
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
            }}
          >
            Open
          </span>
        }
      />
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>@input-kit/menu</h1>
      <p>Context and dropdown menus with real focus management and submenu support.</p>
      <ContextExample />
      <DropdownExample />
      <DisabledExample />
    </div>
  );
}

export default Demo;

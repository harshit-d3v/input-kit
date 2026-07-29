# @input-kit/menu

Headless React context menu and dropdown menu primitives with nested items, keyboard navigation, disabled states, shortcuts, and portal-based rendering.

## Installation

```bash
npm install @input-kit/menu
```

## Quick Start

```tsx
import { ContextMenu, menuItem, menuSeparator } from '@input-kit/menu';

const items = [
	menuItem('copy', 'Copy', { shortcut: 'Ctrl+C' }),
	menuItem('paste', 'Paste', { shortcut: 'Ctrl+V' }),
	menuSeparator(),
	menuItem('delete', 'Delete', { danger: true }),
];

function Example() {
	return (
		<ContextMenu items={items}>
			<div style={{ padding: 40 }}>Right-click me</div>
		</ContextMenu>
	);
}
```

## Exports

### `useContextMenu(options?)`

Returns `{ isOpen, position, open, close, handleContextMenu }`.

### `Menu`

Low-level floating menu component rendered in a portal.

### `ContextMenu`

Wraps children with native right-click handling.

### `DropdownMenu`

Click-triggered menu with `align` and `side` options.

### `menuItem(id, label, options?)`

Helper for creating menu items.

### `menuSeparator()`

Helper for creating separator rows.

## Menu item shape

| Field | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique item id |
| `label` | `string` | Item label |
| `icon` | `ReactNode` | Optional icon |
| `shortcut` | `string` | Shortcut hint text |
| `disabled` | `boolean` | Disable interaction |
| `danger` | `boolean` | Danger styling |
| `onClick` | `() => void` | Selection handler |
| `children` | `MenuItem[]` | Nested submenu items |

## Notes

- Menus clamp their position to the viewport to avoid opening off-screen.
- Keyboard navigation skips disabled items and supports nested submenu opening.
- Rendering is portal-based and SSR-safe.

## License

MIT © Input Kit

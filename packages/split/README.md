# @input-kit/split

Resizable React panel layouts with drag and keyboard support.

## Installation

```bash
npm install @input-kit/split
```

## Features

- Horizontal or vertical layouts
- Controlled or uncontrolled size arrays
- Keyboard-accessible separators with ARIA values
- Double-click a separator to rebalance neighboring panes
- Convenience `Split` and `CollapsibleSplit` helpers

## Usage

```tsx
import { SplitPane } from '@input-kit/split';

function Example() {
	return (
		<div style={{ height: 320 }}>
			<SplitPane defaultSizes={[30, 70]} minSizes={[20, 20]} keyboardStep={4}>
				<div>Sidebar</div>
				<div>Workspace</div>
			</SplitPane>
		</div>
	);
}
```

## Notes

- Focus a separator and use arrow keys to resize.
- Press Enter or Space, or double-click, to rebalance the adjacent pair.
- `CollapsibleSplit` is useful for sidebars, inspectors, and drawers.

## License

MIT © Input Kit

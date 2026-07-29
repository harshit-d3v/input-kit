# @input-kit/tree

Accessible React tree views with selection, checkbox states, keyboard navigation, and virtualization.

## Installation

```bash
npm install @input-kit/tree
```

## Features

- Arrow-key navigation through visible nodes
- Single, multiple, and checkbox selection modes
- Expand/collapse state management via `useTree`
- Indeterminate checkbox logic for nested selections
- Optional icons and configurable indentation
- `VirtualTree` for large datasets

## Usage

```tsx
import { Tree, type TreeNode } from '@input-kit/tree';

const nodes: TreeNode[] = [
	{
		id: 'src',
		label: 'src',
		children: [
			{ id: 'app', label: 'app.tsx' },
			{ id: 'routes', label: 'routes.ts' },
		],
	},
	{ id: 'package', label: 'package.json' },
];

export function Example() {
	return <Tree nodes={nodes} defaultExpandedIds={['src']} />;
}
```

## Virtualized Tree

```tsx
import { VirtualTree } from '@input-kit/tree';

<VirtualTree nodes={nodes} height={320} itemHeight={34} defaultExpandedIds={['src']} />
```

## Notes

- `ArrowRight` expands a node or moves focus into its first child.
- `ArrowLeft` collapses a node or moves focus back to its parent.
- `selectionMode="checkbox"` works best with `showCheckbox` enabled.

## License

MIT © Input Kit

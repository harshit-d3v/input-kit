# @input-kit/tooltip

Accessible React tooltips with smart positioning, interactive content, and controlled or uncontrolled state.

## Installation

```bash
npm install @input-kit/tooltip
```

## Features

- Smart viewport-aware placement with flip-on-collision behavior
- Hover and focus triggers
- Escape dismissal and outside-click dismissal
- Interactive tooltip surfaces for quick actions and teaching UI
- Controlled and uncontrolled open state
- Custom styling without requiring another positioning package

## Usage

```tsx
import { Tooltip } from '@input-kit/tooltip';

export function Example() {
	return (
		<Tooltip content="Launch metrics are refreshed every five minutes.">
			<button type="button">Hover me</button>
		</Tooltip>
	);
}
```

## Interactive Example

```tsx
<Tooltip
	interactive
	placement="right"
	content={<button type="button">Quick action</button>}
>
	<button type="button">Open helper</button>
</Tooltip>
```

## Hook

`useTooltip()` returns trigger props, tooltip props, refs, and visibility controls when you want to compose your own surface.

## Notes

- `delay` controls open timing and `closeDelay` controls hide timing.
- `interactive` enables pointer events and keeps the tooltip open while the pointer or focus moves into the content.
- Use the `style` prop on `Tooltip` to theme the content surface.

## License

MIT © Input Kit

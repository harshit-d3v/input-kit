# @input-kit/gauge

React gauge and meter components with circular and linear variants, threshold-based colors, labels, ticks, and animated transitions.

## Installation

```bash
npm install @input-kit/gauge
```

## Quick Start

```tsx
import { Gauge, LinearGauge } from '@input-kit/gauge';

function Dashboard() {
	return (
		<>
			<Gauge value={68} label="CPU" />
			<LinearGauge value={42} label="Memory" width={280} />
		</>
	);
}
```

## Components

### `Gauge`

Circular gauge with arc, needle, labels, and optional value display.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current reading |
| `min` | `number` | `0` | Minimum bound |
| `max` | `number` | `100` | Maximum bound |
| `label` | `string` | — | Label below the gauge |
| `showValue` | `boolean` | `true` | Show formatted value text |
| `valueFormatter` | `(value: number) => string` | `v => v.toFixed(0)` | Format displayed values |
| `size` | `number` | `200` | SVG width and height |
| `thickness` | `number` | `20` | Arc stroke width |
| `startAngle` | `number` | `-135` | Start angle in degrees |
| `endAngle` | `number` | `135` | End angle in degrees |
| `colors` | `{ value: number; color: string }[]` | green/yellow/red thresholds | Threshold color scale |
| `backgroundColor` | `string` | `#e5e7eb` | Track color |
| `animated` | `boolean` | `true` | Enable CSS transitions |
| `className` | `string` | — | Wrapper class |
| `style` | `React.CSSProperties` | — | Wrapper style |

### `LinearGauge`

Horizontal or vertical meter with optional ticks.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current reading |
| `min` | `number` | `0` | Minimum bound |
| `max` | `number` | `100` | Maximum bound |
| `label` | `string` | — | Label above the meter |
| `showValue` | `boolean` | `true` | Show formatted value text |
| `valueFormatter` | `(value: number) => string` | `v => v.toFixed(0)` | Format displayed values |
| `width` | `number` | `200` | Track width |
| `height` | `number` | `24` | Track height |
| `colors` | `{ value: number; color: string }[]` | green/yellow/red thresholds | Threshold color scale |
| `backgroundColor` | `string` | `#e5e7eb` | Track color |
| `animated` | `boolean` | `true` | Enable CSS transitions |
| `vertical` | `boolean` | `false` | Render vertically |
| `showTicks` | `boolean` | `false` | Show tick labels |
| `tickCount` | `number` | `5` | Number of ticks |
| `className` | `string` | — | Wrapper class |
| `style` | `React.CSSProperties` | — | Wrapper style |

## Notes

- Threshold colors are matched against the normalized percentage from `0` to `100`.
- Invalid ranges (`max <= min`) safely fall back to the minimum value instead of rendering `NaN` dimensions.
- Both components clamp the rendered value inside the provided bounds.

## License

MIT © Input Kit

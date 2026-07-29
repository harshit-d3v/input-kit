# @input-kit/sparkline

Compact SVG charts for dashboards, tables, and inline metrics.

## Installation

```bash
npm install @input-kit/sparkline
```

## Features

- Line, area, bar, and reference-line variants
- Optional dots, end dots, min/max highlighting, and animation
- `limit` prop for trimming large series to the most recent points
- Accessible SVG output via `label`
- `useSparklineData` hook for streaming or rolling datasets

## Usage

```tsx
import { SparkArea, SparkBar, SparklineWithReference } from '@input-kit/sparkline';

function Example() {
	return (
		<>
			<SparkArea data={[12, 18, 15, 24, 20, 28]} label="Revenue trend" />
			<SparkBar data={[8, -4, 12, 16, -2, 20]} label="Net movement" />
			<SparklineWithReference data={[10, 13, 17, 14, 19]} referenceValue={15} />
		</>
	);
}
```

## Notes

- `SparkArea` and `SparklineWithReference` render a single SVG tree, so gradients and overlays stay valid.
- Animated bars use transform-based growth so each bar animates to its own height.
- Pass `label` when the chart communicates standalone meaning.

## License

MIT © Input Kit

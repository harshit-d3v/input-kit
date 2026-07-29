# @input-kit/slider

Headless React slider primitives with single-value and range modes.

## Installation

```bash
npm install @input-kit/slider
```

## Features

- Single-value and dual-thumb range sliders
- Keyboard support with arrow, page, home, and end keys
- Vertical and horizontal layouts
- Ticks, marks, tooltips, and formatted value text
- `onChange` and `onChangeEnd` callbacks

## Usage

```tsx
import { RangeSlider, Slider } from '@input-kit/slider';

function Example() {
	return (
		<>
			<Slider defaultValue={32} min={0} max={100} aria-label="Volume" />
			<RangeSlider defaultValue={[200, 700]} min={0} max={1000} minDistance={50} aria-label="Budget" />
		</>
	);
}
```

## Notes

- `RangeSlider` thumbs are keyboard accessible and respect `minDistance`.
- Use `formatValue` to control tooltip text and `aria-valuetext` output.
- Use `orientation="vertical"` for mixer, brightness, or thermostat controls.

## License

MIT © Input Kit

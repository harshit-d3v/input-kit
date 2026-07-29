# @input-kit/color

Headless, TypeScript-first color picker for React. Supports HEX, RGB, HSL, HSV, and OKLCH color formats with full alpha channel support, ARIA accessibility, keyboard navigation, and all conversion utilities exported.

## Features

- Multiple color formats: HEX, RGB, HSL, HSV, OKLCH
- Full alpha/transparency channel support
- WCAG-compliant contrast utilities (`getContrastRatio`, `getContrastText`)
- Fully accessible: ARIA labels, keyboard navigation, focus management
- Headless — bring your own styles, or use the built-in `ColorInput` component
- All conversion utilities exported for custom use
- TypeScript-first with comprehensive type exports
- Tree-shakeable, no runtime dependencies beyond React

## Installation

```bash
npm install @input-kit/color
```

## Quick Start

### Using the Hook

```tsx
import { useColorPicker } from '@input-kit/color';

function MyComponent() {
  const { color, setColor, hex, rgb, hsl, oklch } = useColorPicker({
    defaultValue: '#007acc',
    format: 'hex',
    showAlpha: true,
    onChange: (state) => console.log(state),
  });

  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <div>HEX: {hex}</div>
      <div>RGB: {rgb.r}, {rgb.g}, {rgb.b}</div>
      <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>
    </div>
  );
}
```

### Using the Component

```tsx
import { ColorInput } from '@input-kit/color';

function MyComponent() {
  const [color, setColor] = useState('#007acc');

  return (
    <ColorInput
      value={color}
      onChange={setColor}
      format="hex"
      showAlpha
      presets={[
        { name: 'Brand', value: '#007acc' },
        { name: 'Success', value: '#28a745' },
        { name: 'Danger', value: '#dc3545' },
      ]}
    />
  );
}
```

## API Reference

### `useColorPicker(options)`

React hook for managing full color picker state.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultValue` | `string` | `'#007acc'` | Initial color value (any supported format) |
| `format` | `ColorFormat` | `'hex'` | Active output format |
| `showAlpha` | `boolean` | `false` | Enable alpha channel |
| `onChange` | `(state: ColorPickerState) => void` | — | Fires on every color change |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `color` | `string` | Current color in the active format |
| `hex` | `string` | Color as HEX string |
| `rgb` | `RGB` | Color as `{ r, g, b, a? }` |
| `hsl` | `HSL` | Color as `{ h, s, l, a? }` |
| `hsv` | `HSV` | Color as `{ h, s, v, a? }` |
| `oklch` | `OKLCH` | Color as `{ l, c, h, a? }` |
| `alpha` | `number` | Alpha value 0–1 |
| `format` | `ColorFormat` | Currently active format |
| `showAlpha` | `boolean` | Whether alpha is enabled |
| `setColor` | `(color: string \| RGB \| HSL \| HSV \| OKLCH) => void` | Set color from any format |
| `setFormat` | `(format: ColorFormat) => void` | Switch the active format |
| `setAlpha` | `(alpha: number) => void` | Set alpha 0–1 |

---

### `ColorInput`

Pre-built accessible color input with a text field, color swatch toggle, preset grid, and optional alpha slider.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled color value |
| `onChange` | `(value: string) => void` | — | Fires with formatted color string |
| `format` | `ColorFormat` | `'hex'` | Output format |
| `showAlpha` | `boolean` | `false` | Show alpha slider in picker |
| `presets` | `ColorPreset[]` | `defaultPresets` | Preset color swatches |
| `disabled` | `boolean` | `false` | Disables all controls |
| `placeholder` | `string` | `'Enter color...'` | Input placeholder |
| `aria-label` | `string` | — | Accessible label for the input |
| `aria-labelledby` | `string` | — | ID of labelling element |
| `id` | `string` | auto | HTML `id` for the root element |
| `className` | `string` | — | Class on the wrapper |
| `style` | `CSSProperties` | — | Style on the wrapper |

---

### `useColorInput(props)`

Headless hook version of `ColorInput`. Returns all state and prop-getter functions so you can build a completely custom UI.

```tsx
import { useColorInput } from '@input-kit/color';

function MyColorInput() {
  const {
    inputValue, hex, rgb, hsl, alpha, isOpen, isValid, presets,
    containerRef,
    getInputProps, getToggleProps, getPickerProps,
    getPresetProps, getAlphaSliderProps,
    setIsOpen, setColor, setAlpha,
  } = useColorInput({ value: '#ff0000', onChange: console.log });

  return (
    <div ref={containerRef}>
      <input {...getInputProps()} />
      <button {...getToggleProps()} style={{ background: hex }} />
      {isOpen && (
        <div {...getPickerProps()}>
          {presets.map((p, i) => (
            <button key={p.value} {...getPresetProps(p, i)} style={{ background: p.value }} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Utility Functions

All utilities are exported for custom implementations:

```ts
import {
  hexToRgb,         // hexToRgb('#ff0000') => { r: 255, g: 0, b: 0 }
  rgbToHex,         // rgbToHex({ r: 255, g: 0, b: 0 }) => '#ff0000'
  rgbToHsl,         // => { h, s, l }
  hslToRgb,
  rgbToHsv,         // => { h, s, v }
  hsvToRgb,
  rgbToOklch,       // => { l, c, h }
  oklchToRgb,
  parseColor,       // parseColor('hsl(0, 100%, 50%)') => ParsedColor
  formatColor,      // formatColor(rgb, 'hsl') => 'hsl(0, 100%, 50%)'
  isValidColor,     // isValidColor('#zzz') => false
  getContrastRatio, // WCAG 2.1 contrast ratio between two colors (1–21)
  getContrastText,  // getContrastText('#003366') => '#ffffff'
} from '@input-kit/color';
```

---

## Color Formats

### HEX
```
'#ff0000'      — 6-digit RGB
'#f00'         — 3-digit shorthand
'#ff000080'    — 8-digit with alpha
```

### RGB / RGBA
```
{ r: 255, g: 0, b: 0 }
{ r: 255, g: 0, b: 0, a: 0.5 }
'rgb(255, 0, 0)'
'rgba(255, 0, 0, 0.5)'
```

### HSL / HSLA
```
{ h: 0, s: 100, l: 50 }
'hsl(0, 100%, 50%)'
'hsla(0, 100%, 50%, 0.5)'
```

### HSV
```
{ h: 0, s: 100, v: 100 }
```

### OKLCH
```
{ l: 0.63, c: 0.26, h: 29 }
'oklch(0.63 0.26 29)'
```

### CSS Named Colors
`parseColor` recognises 21 CSS named colors: `black`, `white`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `silver`, `gray`/`grey`, `maroon`, `olive`, `lime`, `aqua`, `teal`, `navy`, `fuchsia`, `purple`, `orange`, `transparent`.

---

## Accessibility

- ARIA `role="dialog"` on the picker dropdown
- `aria-expanded`, `aria-controls`, `aria-haspopup` on the toggle button
- `aria-invalid` on the text input when the value is not a valid color
- `aria-label` on every preset swatch button, alpha slider
- Full keyboard navigation:

| Key | Action |
|-----|--------|
| `Enter` | Toggle picker open/closed |
| `Escape` | Close picker, return focus to input |
| `ArrowDown` | Open picker (from input) / move preset down one row |
| `ArrowUp` | Move preset up one row / return focus to input |
| `ArrowLeft` / `ArrowRight` | Navigate presets left/right |
| `Tab` | Move between input, toggle button, presets |

---

## TypeScript

```tsx
import type {
  ColorFormat,
  RGB, HSL, HSV, OKLCH, HEX,
  ColorPickerState,
  UseColorPickerOptions,
  UseColorPickerReturn,
  ColorPreset,
  ColorInputProps,
  ParsedColor,
} from '@input-kit/color';
```

## License

MIT © Harshit

# @input-kit/number

Headless number input component for React with locale support, currency formatting, and full TypeScript support.

## Features

- **Headless** - Bring your own styles
- **Locale-aware** - Automatic number formatting for any locale
- **Currency support** - Built-in currency formatting
- **Keyboard navigation** - Arrow keys and Home/End support
- **Accessible** - ARIA attributes and keyboard support
- **Tiny** - Tree-shakeable, minimal dependencies
- **TypeScript** - Full type safety

## Installation

```bash
npm install @input-kit/number
# or
yarn add @input-kit/number
# or
pnpm add @input-kit/number
```

## Quick Start

### Using the Hook (Recommended)

```tsx
import { useNumberInput } from '@input-kit/number';

function MyComponent() {
  const { inputProps, value, increment, decrement } = useNumberInput({
    defaultValue: 100,
    min: 0,
    max: 1000,
    step: 10,
  });

  return (
    <div>
      <input {...inputProps} className="my-input" />
      <button onClick={decrement}>-</button>
      <span>{value}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### Using the Component

```tsx
import { NumberInput } from '@input-kit/number';

function MyComponent() {
  const [value, setValue] = useState<number | null>(100);

  return (
    <NumberInput
      value={value}
      onChange={setValue}
      min={0}
      max={1000}
      step={10}
      className="my-input"
    />
  );
}
```

## Currency Formatting

```tsx
const { inputProps, formattedValue } = useNumberInput({
  format: 'currency',
  currency: 'EUR',
  locale: 'de-DE',
});

// Displays: 1.234,56 €
```

## Percentage Formatting

```tsx
const { inputProps } = useNumberInput({
  format: 'percent',
  decimals: 1,
});

// Displays: 15.5%
```

## API Reference

### `useNumberInput(options)`

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `number \| null` | - | Controlled value |
| `defaultValue` | `number \| null` | `null` | Default value (uncontrolled) |
| `onChange` | `(value: number \| null) => void` | - | Change handler |
| `min` | `number` | - | Minimum value |
| `max` | `number` | - | Maximum value |
| `step` | `number` | `1` | Step increment |
| `decimals` | `number` | - | Number of decimal places |
| `format` | `'decimal' \| 'currency' \| 'percent'` | `'decimal'` | Format style |
| `currency` | `string` | `'USD'` | Currency code (for currency format) |
| `currencyDisplay` | `'symbol' \| 'narrowSymbol' \| 'code' \| 'name'` | `'symbol'` | Currency display style |
| `locale` | `string \| string[]` | Browser locale | Locale for formatting |
| `allowNegative` | `boolean` | `true` | Allow negative numbers |
| `allowEmpty` | `boolean` | `true` | Allow empty value |
| `formatter` | `(value: number \| null) => string` | - | Custom formatter |
| `parser` | `(value: string) => number \| null` | - | Custom parser |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `value` | `number \| null` | Current numeric value |
| `formattedValue` | `string` | Formatted display value |
| `inputValue` | `string` | Raw input value |
| `isFocused` | `boolean` | Whether input is focused |
| `isValid` | `boolean` | Whether value is valid |
| `error` | `string \| null` | Validation error message |
| `setValue` | `(value: number \| null) => void` | Set value directly |
| `increment` | `() => void` | Increment by step |
| `decrement` | `() => void` | Decrement by step |
| `clear` | `() => void` | Clear the input |
| `focus` | `() => void` | Focus the input |
| `blur` | `() => void` | Blur the input |
| `inputProps` | `object` | Props to spread on input element |

### `NumberInput` Component

All hook options plus standard input props:

- `className`
- `placeholder`
- `disabled`
- `readOnly`
- `name`
- `id`
- `aria-label`
- `aria-labelledby`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` | Increment by step |
| `↓` | Decrement by step |
| `Home` | Set to minimum (if defined) |
| `End` | Set to maximum (if defined) |

## License

MIT © Input Kit

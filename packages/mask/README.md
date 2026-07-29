# @input-kit/mask

React input masking utilities with a headless hook, ready-to-use masked input component, and common presets for phone, card, date, and other structured formats.

## Installation

```bash
npm install @input-kit/mask
```

## Quick Start

```tsx
import { MaskedInput, masks } from '@input-kit/mask';

function Example() {
	return (
		<MaskedInput
			mask={masks.phone}
			onChange={(masked, raw) => {
				console.log(masked, raw);
			}}
		/>
	);
}
```

## Hook

### `useMask(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mask` | `string \| MaskChar[]` | — | Required mask definition |
| `guide` | `boolean` | `true` | Show placeholder characters for unfilled positions |
| `placeholderChar` | `string` | `'_'` | Placeholder character for editable slots |
| `onChange` | `(maskedValue, rawValue) => void` | — | Receives both conformed and raw values |

Returns `value`, `rawValue`, `setValue`, event handlers, `inputRef`, and `isComplete`.

## Component

### `MaskedInput`

| Prop | Type | Description |
|------|------|-------------|
| `mask` | `string \| MaskChar[]` | Mask definition |
| `value` | `string` | Controlled value |
| `onChange` | `(maskedValue, rawValue) => void` | Value callback |
| `placeholder` | `string` | Native input placeholder |
| `guide` | `boolean` | Show guide characters |
| `placeholderChar` | `string` | Guide character |
| `showMaskOnFocus` | `boolean` | Show guide only on focus |
| `disabled` | `boolean` | Disable the input |
| `className` | `string` | Input class |
| `style` | `React.CSSProperties` | Inline styles |
| `id` | `string` | Input id |
| `name` | `string` | Input name |
| `autoFocus` | `boolean` | Focus on mount |

## Built-in masks

`masks.phone`, `masks.phoneIntl`, `masks.ssn`, `masks.zip`, `masks.zipPlus4`, `masks.creditCard`, `masks.date`, `masks.time`, `masks.time12`, `masks.currency`

## Utilities

- `parseMask(mask)`
- `conformToMask(value, mask, options?)`
- `getRawValue(maskedValue, mask, placeholderChar?)`
- `isComplete(maskedValue, mask, placeholderChar?)`

## Notes

- Controlled updates now synchronize through the hook state directly instead of a synthetic event path.
- Forwarded refs and the internal caret-management ref are both maintained, so imperative focus and caret restoration work together.

## License

MIT © Input Kit

# @input-kit/otp

Accessible OTP and verification-code inputs for React with paste support, keyboard navigation, masking, separators, and a headless hook for custom layouts.

## Installation

```bash
npm install @input-kit/otp
```

## Quick Start

```tsx
import { OtpInput } from '@input-kit/otp';

function VerifyForm() {
	return (
		<OtpInput
			length={6}
			onChange={(value) => console.log(value)}
			onComplete={(value) => console.log('Complete:', value)}
		/>
	);
}
```

## Exports

### `useOtpInput(options)`

Hook for building custom OTP interfaces.

Options:

| Option | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | `6` | Number of cells |
| `initialValue` | `string` | `''` | Initial code value |
| `onChange` | `(value: string) => void` | - | Called on every update |
| `onComplete` | `(value: string) => void` | - | Called when all cells are filled |
| `type` | `'numeric' \| 'alphanumeric' \| 'alpha'` | `'numeric'` | Allowed characters |
| `autoFocus` | `boolean` | `false` | Focus the first cell on mount |

Returned API:

- `value`: array of cell values
- `setValue(value)`: set the full OTP string
- `focusedIndex`: active cell index
- `setFocusedIndex(index)`: move focus programmatically
- `handleChange(index, char)`: apply one character
- `handleKeyDown(index, event)`: handle navigation and deletion
- `handlePaste(event)`: distribute pasted values across cells
- `handleFocus(index)`: sync focused index
- `inputRefs`: refs for individual inputs
- `isComplete`: `true` when all cells are filled
- `clear()`: reset the code

### `OtpInput`

Default boxed OTP input component.

Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | `6` | Number of cells |
| `value` | `string` | - | Controlled value |
| `onChange` | `(value: string) => void` | - | Change callback |
| `onComplete` | `(value: string) => void` | - | Completion callback |
| `type` | `'numeric' \| 'alphanumeric' \| 'alpha'` | `'numeric'` | Allowed characters |
| `autoFocus` | `boolean` | `false` | Focus first cell on mount |
| `disabled` | `boolean` | `false` | Disable all inputs |
| `masked` | `boolean` | `false` | Hide characters with password inputs |
| `separator` | `ReactNode` | - | Element inserted after selected indices |
| `separatorAfter` | `number[]` | `[]` | Indices after which separators render |
| `inputClassName` | `string` | - | Class applied to each cell |
| `inputStyle` | `React.CSSProperties` | - | Inline styles for each cell |
| `className` | `string` | - | Wrapper class |
| `style` | `React.CSSProperties` | - | Wrapper style |
| `placeholder` | `string` | `'-'` | Placeholder for empty cells |
| `aria-label` | `string` | `'OTP input'` | Group label |

### `OtpInputUnderline`

Underline-styled variant.

### `OtpInputCircle`

Circular input variant.

## Notes

- `type="numeric"` uses `inputMode="numeric"` for better mobile keyboards.
- Alphabetic and alphanumeric inputs are normalized to uppercase.
- Pasting a valid code distributes characters automatically across the fields.

## License

MIT © Input Kit

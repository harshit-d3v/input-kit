# @input-kit/pin

A React component library for PIN and OTP input fields with full keyboard navigation, paste support, and accessibility features.

## Features

- **PIN Input** - Numeric-only input for PIN codes
- **OTP Input** - Alphanumeric support for OTP codes
- **Auto-focus** - Automatically focuses next input
- **Paste Support** - Paste full code from clipboard
- **Backspace Handling** - Smart backspace navigation
- **Masking** - Show or hide input with password type
- **Validation** - Custom validation support
- **Keyboard Navigation** - Arrow keys, Home, End support
- **Accessible** - Full ARIA support
- **Headless Hook** - Build custom inputs with `usePinInput`

## Installation

```bash
npm install @input-kit/pin
```

## Quick Start

### PIN Input

```tsx
import { PinInput } from '@input-kit/pin';

function App() {
  const [pin, setPin] = useState('');

  return (
    <PinInput
      length={4}
      value={pin}
      onChange={setPin}
      mask
      onComplete={(code) => console.log('PIN:', code)}
    />
  );
}
```

### OTP Input

```tsx
import { OtpInput } from '@input-kit/pin';

function App() {
  const [otp, setOtp] = useState('');

  return (
    <OtpInput
      length={6}
      value={otp}
      onChange={setOtp}
      alphanumeric
      onComplete={(code) => verifyOtp(code)}
    />
  );
}
```

### usePinInput Hook

```tsx
import { usePinInput } from '@input-kit/pin';

function CustomPinInput() {
  const { values, handlers, inputRefs, clear, isComplete } = usePinInput({
    length: 6,
    onComplete: (code) => console.log('Complete:', code),
  });

  return (
    <div>
      {values.map((char, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          value={char}
          onChange={(e) => handlers.onChange(index, e)}
          onKeyDown={(e) => handlers.onKeyDown(index, e)}
          onPaste={(e) => handlers.onPaste(index, e)}
          onFocus={(e) => handlers.onFocus(index, e)}
        />
      ))}
      <button onClick={clear}>Clear</button>
      {isComplete && <span>Complete!</span>}
    </div>
  );
}
```

## API Reference

### PinInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | required | Number of input characters |
| `value` | `string` | required | Current value |
| `onChange` | `(value: string) => void` | required | Callback when value changes |
| `onComplete` | `(value: string) => void` | - | Callback when all inputs filled |
| `mask` | `boolean` | `false` | Whether to mask the input |
| `placeholder` | `string` | `''` | Placeholder character |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `readOnly` | `boolean` | `false` | Whether the input is read-only |
| `validate` | `(char: string) => boolean` | - | Custom validation function |
| `className` | `string` | `''` | Custom class for container |
| `inputClassName` | `string` | `''` | Custom class for each input |
| `autoFocus` | `boolean` | `false` | Auto-focus first input on mount |

### OtpInput Props

Same as `PinInput`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alphanumeric` | `boolean` | `false` | Allow alphanumeric characters |

### usePinInput Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `length` | `number` | required | Number of input characters |
| `value` | `string` | `''` | Current value |
| `onChange` | `(value: string) => void` | - | Callback when value changes |
| `onComplete` | `(value: string) => void` | - | Callback when all inputs filled |
| `alphanumeric` | `boolean` | `false` | Allow alphanumeric characters |
| `validate` | `(char: string) => boolean` | - | Custom validation function |
| `autoFocus` | `boolean` | `false` | Auto-focus first input on mount |

### usePinInput Return

| Property | Type | Description |
|----------|------|-------------|
| `values` | `string[]` | Array of individual character values |
| `setValue` | `(index: number, value: string) => void` | Set value at specific index |
| `setValues` | `(value: string) => void` | Set entire value |
| `clear` | `() => void` | Clear all inputs |
| `isComplete` | `boolean` | Whether all inputs are filled |
| `handlers` | Object | Event handlers for inputs |
| `inputRefs` | `RefObject<(HTMLInputElement \| null)[]>` | Refs for input elements |
| `focusInput` | `(index: number) => void` | Focus a specific input |

## Keyboard Navigation

- **Arrow Left/Right** - Navigate between inputs
- **Backspace** - Delete current character, move back if empty
- **Delete** - Delete current character
- **Home** - Focus first input
- **End** - Focus last input
- **Ctrl+V** - Paste full code

## Custom Styling

Both components accept `className` and `inputClassName` props for styling:

```tsx
<PinInput
  length={4}
  value={pin}
  onChange={setPin}
  className="my-container"
  inputClassName="my-input"
/>
```

```css
.my-container {
  display: flex;
  gap: 0.5rem;
}

.my-input {
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
}

.my-input:focus {
  border-color: #007acc;
  outline: none;
}
```

## Custom Validation

```tsx
// Only allow even digits
<PinInput
  length={4}
  value={pin}
  onChange={setPin}
  validate={(char) => ['0', '2', '4', '6', '8'].includes(char)}
/>
```

## TypeScript

Full TypeScript support is included:

```tsx
import type { 
  PinInputProps, 
  OtpInputProps, 
  UsePinInputOptions,
  PinInputRef,
  OtpInputRef 
} from '@input-kit/pin';
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT

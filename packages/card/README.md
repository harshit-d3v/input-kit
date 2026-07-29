# @input-kit/card

Headless, TypeScript-first credit card input components for React. Auto-detects card type, formats card numbers, validates via Luhn algorithm, and handles expiry/CVV — bring your own styles.

## Features

- Auto-detects 8 card networks: Visa, Mastercard, Amex, Discover, Diners Club, JCB, UnionPay, Maestro
- Smart formatting — Amex `3782 822463 10005`, standard `4111 1111 1111 1111`
- Luhn algorithm validation built-in
- Mask card number when unfocused
- CVV length is card-type aware (4 digits for Amex, 3 for all others)
- Expiry auto-formats as `MM/YY` with leading-zero correction
- `useCardInput` hook for full form state management
- All utility functions exported for custom use
- Zero runtime dependencies beyond React

## Installation

```bash
npm install @input-kit/card
```

## Components

### `CardInput`

Card number field with auto-detection, formatting, and optional masking.

```tsx
import { CardInput } from '@input-kit/card';

function PaymentForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState('unknown');

  return (
    <CardInput
      value={cardNumber}
      onChange={(value, type) => {
        setCardNumber(value);
        setCardType(type);
      }}
      masked={false}
      showIcon={true}
    />
  );
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Raw digits (no spaces) |
| `onChange` | `(value: string, cardType: CardType) => void` | — | Called with raw digits + detected type |
| `onBlur` | `() => void` | — | Blur callback |
| `placeholder` | `string` | `'1234 5678 9012 3456'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disables the field |
| `masked` | `boolean` | `false` | Shows `•••• •••• •••• 1234` when blurred |
| `showIcon` | `boolean` | `true` | Shows card icon on the left |
| `className` | `string` | — | Class for the wrapper `<div>` |
| `style` | `CSSProperties` | — | Style for the wrapper `<div>` |
| `id` | `string` | — | Input `id` |
| `name` | `string` | — | Input `name` |
| `aria-label` | `string` | `'Card number'` | Accessible label |

---

### `ExpiryInput`

Expiry date field, auto-formats to `MM/YY`. Auto-prepends `0` if first digit > 1.

```tsx
import { ExpiryInput } from '@input-kit/card';

<ExpiryInput
  value={expiry}
  onChange={setExpiry}
  placeholder="MM/YY"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Formatted expiry string |
| `onChange` | `(value: string) => void` | — | Called with formatted value |
| `onBlur` | `() => void` | — | Blur callback |
| `placeholder` | `string` | `'MM/YY'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disables the field |
| `className` | `string` | — | Class for the input |
| `style` | `CSSProperties` | — | Style for the input |

---

### `CvvInput`

CVV/CVC field. Masked by default. Max length adjusts automatically for Amex (4 digits) vs all others (3 digits).

```tsx
import { CvvInput } from '@input-kit/card';

<CvvInput
  value={cvv}
  onChange={setCvv}
  cardType={cardType}   // pass detected type for correct max length
  masked={true}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | CVV digits |
| `onChange` | `(value: string) => void` | — | Called with raw digits |
| `onBlur` | `() => void` | — | Blur callback |
| `cardType` | `CardType` | `'unknown'` | Determines max digit length |
| `placeholder` | `string` | `'CVV'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disables the field |
| `masked` | `boolean` | `true` | Renders as `type="password"` |
| `className` | `string` | — | Class for the input |
| `style` | `CSSProperties` | — | Style for the input |

---

## `useCardInput` Hook

Manages full card form state including validation and error messages.

```tsx
import { useCardInput } from '@input-kit/card';

function PaymentForm() {
  const {
    cardNumber,
    cardNumberFormatted,
    cardType,
    expiryDate,
    cvv,
    cardholderName,
    isValid,
    isCardNumberValid,
    isExpiryValid,
    isCvvValid,
    errors,
    setCardNumber,
    setExpiryDate,
    setCvv,
    setCardholderName,
    validate,
    reset,
  } = useCardInput({
    onCardTypeChange: (type) => console.log('Card type:', type),
    onValidationChange: (valid) => console.log('Valid:', valid),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // all fields valid — submit
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={cardNumberFormatted}
        onChange={(e) => setCardNumber(e.target.value)}
        placeholder="Card number"
      />
      {errors.cardNumber && <span>{errors.cardNumber}</span>}

      <input
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        placeholder="MM/YY"
      />
      {errors.expiryDate && <span>{errors.expiryDate}</span>}

      <input
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        placeholder="CVV"
        type="password"
      />
      {errors.cvv && <span>{errors.cvv}</span>}

      <button type="submit">Pay</button>
    </form>
  );
}
```

### Hook Options

| Option | Type | Description |
|--------|------|-------------|
| `initialCardNumber` | `string` | Pre-fill card number |
| `initialExpiryDate` | `string` | Pre-fill expiry (`MM/YY`) |
| `initialCvv` | `string` | Pre-fill CVV |
| `initialCardholderName` | `string` | Pre-fill cardholder name |
| `onCardTypeChange` | `(type: CardType) => void` | Fires when card network is detected |
| `onValidationChange` | `(isValid: boolean) => void` | Fires when overall validity changes |

### Hook Return

| Field | Type | Description |
|-------|------|-------------|
| `cardNumber` | `string` | Raw digits |
| `cardNumberFormatted` | `string` | Formatted with spaces |
| `cardType` | `CardType` | Detected card network |
| `expiryDate` | `string` | `MM/YY` string |
| `expiryMonth` | `string` | Parsed month |
| `expiryYear` | `string` | Parsed 2-digit year |
| `cvv` | `string` | CVV digits |
| `cardholderName` | `string` | Cardholder name |
| `isValid` | `boolean` | All fields are valid |
| `isCardNumberValid` | `boolean` | Card number passes Luhn |
| `isExpiryValid` | `boolean` | Expiry is valid and not expired |
| `isCvvValid` | `boolean` | CVV length is correct |
| `errors` | `CardErrors` | Per-field error messages |
| `setCardNumber` | `(v: string) => void` | Update card number |
| `setExpiryDate` | `(v: string) => void` | Update expiry |
| `setCvv` | `(v: string) => void` | Update CVV |
| `setCardholderName` | `(v: string) => void` | Update name |
| `validate` | `() => boolean` | Trigger full validation, populates `errors` |
| `reset` | `() => void` | Reset all fields |

---

## Utility Functions

All utilities are exported for use in custom implementations:

```ts
import {
  detectCardType,    // detectCardType('4111...') => 'visa'
  luhnCheck,         // luhnCheck('4111111111111111') => true
  formatCardNumber,  // formatCardNumber('4111111111111111', 'visa') => '4111 1111 1111 1111'
  formatExpiryDate,  // formatExpiryDate('1224') => '12/24'
  validateCardNumber,
  validateExpiryDate,
  validateCvv,
  maskCardNumber,    // maskCardNumber('4111111111111111') => '•••• •••• •••• 1111'
  parseExpiryDate,   // parseExpiryDate('12/24') => { month: '12', year: '24' }
  getCardInfo,       // getCardInfo('amex') => { lengths: [15], cvvLength: 4, gaps: [4, 10], ... }
  getMaxCardLength,
  CARD_PATTERNS,
} from '@input-kit/card';
```

## Supported Card Types

| Network | Prefix | Lengths | CVV |
|---------|--------|---------|-----|
| Visa | `4` | 16, 18, 19 | 3 |
| Mastercard | `51–55`, `2221–2720` | 16 | 3 |
| American Express | `34`, `37` | 15 | 4 |
| Discover | `6011`, `644–649`, `65`, `622` | 16, 19 | 3 |
| Diners Club | `36`, `38`, `300–305` | 14, 16, 19 | 3 |
| JCB | `35` | 16–19 | 3 |
| UnionPay | `62` | 16–19 | 3 |
| Maestro | `50`, `56–59`, `6` | 12–19 | 3 |

## License

MIT © Harshit

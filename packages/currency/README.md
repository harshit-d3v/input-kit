# @input-kit/currency

Lightweight currency formatting, parsing, and conversion utilities for TypeScript/JavaScript powered by the native `Intl.NumberFormat` API.

## Installation

```bash
npm install @input-kit/currency
```

## Quick Start

```ts
import { formatCurrency, parseCurrency, useCurrency } from '@input-kit/currency';

formatCurrency(1234.5);                         // "$1,234.50"
formatCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' }); // "1.234,50 €"
parseCurrency('$1,234.50');                     // 1234.5
```

## API Reference

### `formatCurrency(amount, options?)`

Formats a number as a currency string using `Intl.NumberFormat`.

```ts
function formatCurrency(amount: number, options?: CurrencyOptions): string
```

```ts
formatCurrency(9999.99);                          // "$9,999.99"
formatCurrency(9999.99, { style: 'code' });       // "USD 9,999.99"
formatCurrency(9999.99, { style: 'name' });       // "9,999.99 US dollars"
formatCurrency(9999.99, { currency: 'JPY', locale: 'ja-JP' }); // "￥10,000"
```

---

### `formatCurrencyNumber(amount, options?)`

Formats a number with decimal grouping but **without** a currency symbol.

```ts
function formatCurrencyNumber(amount: number, options?: CurrencyOptions): string
```

```ts
formatCurrencyNumber(1234567.89); // "1,234,567.89"
```

---

### `getCurrencySymbol(currency?, locale?)`

Returns the symbol for a given currency code.

```ts
function getCurrencySymbol(currency?: string, locale?: string): string
```

```ts
getCurrencySymbol('EUR', 'de-DE'); // "€"
getCurrencySymbol('JPY', 'ja-JP'); // "￥"
getCurrencySymbol('GBP');          // "£"
```

---

### `parseCurrency(value)`

Strips currency symbols, spaces, and thousand separators, then parses to a `number`. Uses a simple regex — suitable for `en-US`-style formatting (`$1,234.56`). European formats with comma as decimal separator (`1.234,56`) are not supported.

```ts
function parseCurrency(value: string): number
```

```ts
parseCurrency('$1,234.56');   // 1234.56
parseCurrency('-€999.00');    // -999
parseCurrency('invalid');     // 0
```

---

### `convertCurrency(amount, from, to)`

Converts an amount between currencies using built-in static exchange rates. Rates are illustrative reference values — **not** live rates. Throws if an unsupported currency code is provided.

```ts
function convertCurrency(amount: number, from: string, to: string): number
```

Supported currency codes: `USD` `EUR` `GBP` `JPY` `CAD` `AUD` `CHF` `CNY` `INR` `BRL`

```ts
convertCurrency(100, 'USD', 'EUR'); // ~85
convertCurrency(100, 'USD', 'JPY'); // ~11000
```

---

### `useCurrency(options?)` hook

Returns formatting helpers bound to the given options. Useful in React components to avoid repeating options on every call.

```ts
function useCurrency(options?: CurrencyOptions): {
  format: (amount: number) => string;
  formatNumber: (amount: number) => string;
  symbol: string;
  parse: (value: string) => number;
}
```

```tsx
function PriceTag({ amount }: { amount: number }) {
  const { format, symbol } = useCurrency({ currency: 'EUR', locale: 'de-DE' });
  return <span>{format(amount)}</span>;
}
```

---

## Types

```ts
interface CurrencyOptions {
  currency?: string;             // ISO 4217 code, default 'USD'
  locale?: string;               // BCP 47 locale, default 'en-US'
  style?: 'symbol' | 'code' | 'name'; // default 'symbol'
  minimumFractionDigits?: number; // default 2
  maximumFractionDigits?: number; // default 2
}
```

## License

MIT © Input Kit

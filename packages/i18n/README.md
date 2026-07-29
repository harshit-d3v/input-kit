# @input-kit/i18n

Lightweight React internationalization utilities with locale switching, nested translation keys, interpolation, pluralization, and `Intl`-based formatters.

## Installation

```bash
npm install @input-kit/i18n
```

## Quick Start

```tsx
import { I18nProvider, Trans, useI18n } from '@input-kit/i18n';

const config = {
	locale: 'en',
	fallbackLocale: 'en',
	messages: {
		en: { common: { greeting: 'Hello {{name}}' } },
		fr: { common: { greeting: 'Bonjour {{name}}' } },
	},
};

function Greeting() {
	const { t, setLocale } = useI18n();

	return (
		<>
			<p>{t('common.greeting', { name: 'Ada' })}</p>
			<button onClick={() => setLocale('fr')}>FR</button>
		</>
	);
}

function App() {
	return (
		<I18nProvider config={config}>
			<Greeting />
			<Trans i18nKey="common.greeting" params={{ name: 'Grace' }} />
		</I18nProvider>
	);
}
```

## Provider

### `I18nProvider`

```ts
interface I18nConfig {
	locale: string;
	fallbackLocale?: string;
	messages: LocaleMessages;
	onMissingKey?: (key: string, locale: string) => string;
}
```

| Config field | Type | Description |
|--------------|------|-------------|
| `locale` | `string` | Active locale code |
| `fallbackLocale` | `string` | Locale to use when the active locale misses a key |
| `messages` | `LocaleMessages` | Locale-to-message dictionary |
| `onMissingKey` | `(key, locale) => string` | Optional custom fallback for missing translations |

## Hooks

### `useI18n()`

Returns the full i18n context.

| Field | Type | Description |
|-------|------|-------------|
| `locale` | `string` | Active locale |
| `setLocale` | `(locale: string) => void` | Switch locale |
| `t` | `TranslateFunction` | Translate a key with optional params |
| `formatNumber` | `(value, options?) => string` | `Intl.NumberFormat` wrapper |
| `formatDate` | `(date, options?) => string` | `Intl.DateTimeFormat` wrapper |
| `formatCurrency` | `(value, currency?) => string` | Currency formatter |
| `formatRelativeTime` | `(value, unit) => string` | Relative time formatter |
| `isRTL` | `boolean` | Whether the locale is right-to-left |
| `availableLocales` | `string[]` | Locales found in `messages` |

### `useTranslation()`

Returns `{ t, locale }` for components that only need translation access.

### `useLocale()`

Returns `{ locale, setLocale, availableLocales, isRTL }`.

### `useFormatters()`

Returns `{ formatNumber, formatDate, formatCurrency, formatRelativeTime, locale }`.

## Components

### `Trans`

Renders a translated string inside a configurable tag.

| Prop | Type | Description |
|------|------|-------------|
| `i18nKey` | `string` | Dot-notated translation key |
| `params` | `Record<string, string \| number>` | Interpolation values |
| `tag` | `keyof JSX.IntrinsicElements` | Wrapper element, default `span` |
| `className` | `string` | Optional class |
| `style` | `React.CSSProperties` | Optional inline styles |

### `LocaleSwitcher`

Simple locale `<select>` bound to the provider state.

## Utilities

### `createTranslations(translations)`

Identity helper for authoring typed translation objects.

### `mergeMessages(...messageSets)`

Shallow-merges multiple locale message collections.

### `detectBrowserLocale(supportedLocales, fallback?)`

Matches the browser locale against a supported locale list.

### `dateFormats` and `numberFormats`

Prebuilt `Intl.DateTimeFormatOptions` and `Intl.NumberFormatOptions` presets.

## Notes

- Nested translation keys use dot notation such as `common.errors.required`.
- Pluralization supports `one | other` and `zero | one | other` string templates when `count` is provided.
- Missing keys return the key string unless `onMissingKey` is configured.

## License

MIT © Input Kit

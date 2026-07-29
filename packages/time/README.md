# @input-kit/time

Locale-aware relative time, countdown, and stopwatch utilities for React.

## Installation

```bash
npm install @input-kit/time
```

## Features

- Relative time formatting with locale support
- Short, long, and narrow output styles
- Smart auto-refresh scheduling for live labels
- Context formatting for today, yesterday, and tomorrow
- Countdown and stopwatch hooks and components

## Usage

```tsx
import { Countdown, RelativeTime, Stopwatch } from '@input-kit/time';

function Example() {
	return (
		<>
			<RelativeTime date={Date.now() - 90_000} locale="fr-FR" formatStyle="long" />
			<Countdown targetDate={Date.now() + 3_600_000} format="compact" />
			<Stopwatch />
		</>
	);
}
```

## Notes

- When `Intl.RelativeTimeFormat` is available, relative labels are localized automatically.
- `RelativeTime` renders a semantic `<time>` element with `dateTime` and `title` attributes.
- `useRelativeTime` refreshes based on the current distance from the target date instead of a fixed global interval.

## License

MIT © Input Kit

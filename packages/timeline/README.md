# @input-kit/timeline

Accessible React timelines for launches, customer journeys, hiring loops, and milestone storytelling.

## Installation

```bash
npm install @input-kit/timeline
```

## Features

- Vertical and horizontal timelines
- Left, right, centered, and alternating layouts
- Status-aware markers for completed, current, pending, and error states
- Grouped sections and labeled separators
- Clickable items with active-state tracking
- Utilities for formatting, sorting, and grouping events

## Usage

```tsx
import { Timeline, type TimelineEvent } from '@input-kit/timeline';

const events: TimelineEvent[] = [
	{
		id: 'beta',
		title: 'Private beta',
		description: 'Invite pilot customers and capture feedback.',
		date: '2026-04-08',
		status: 'current',
	},
	{
		id: 'launch',
		title: 'Public launch',
		description: 'Ship docs, onboarding, and support.',
		date: '2026-04-22',
		status: 'pending',
	},
];

export function Example() {
	return <Timeline events={events} position="alternate" />;
}
```

## Also Available

- `TimelineItem` for custom item composition
- `TimelineGroup` for collapsible grouped sections
- `TimelineSeparator` for labeled dividers
- `useTimeline` for event list state management
- `formatTimelineDate`, `sortEventsByDate`, `groupEventsByDate`

## Notes

- Use `position="alternate"` for portfolio or launch storytelling layouts.
- Use `orientation="horizontal"` when the narrative should scan left-to-right.
- Current items expose `aria-current="step"` for assistive technology.

## License

MIT © Input Kit

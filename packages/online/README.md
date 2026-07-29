# @input-kit/online

React hooks for browser online/offline status and connection metadata such as downlink, effective connection type, RTT, and data-saver mode.

## Installation

```bash
npm install @input-kit/online
```

## Quick Start

```tsx
import { useOnline, useIsOnline } from '@input-kit/online';

function Banner() {
	const isOnline = useIsOnline();
	const { effectiveType, rtt } = useOnline();

	return (
		<div>
			<p>{isOnline ? 'Online' : 'Offline'}</p>
			<p>{effectiveType ?? 'unknown'} • {rtt ?? '--'}ms</p>
		</div>
	);
}
```

## Hooks

### `useOnline()`

Returns a `NetworkState` object:

| Field | Type | Description |
|------|------|-------------|
| `online` | `boolean` | Current browser connectivity state |
| `offlineAt` | `Date \| undefined` | Timestamp of the last offline transition |
| `onlineAt` | `Date \| undefined` | Timestamp of the last online transition |
| `downlink` | `number \| undefined` | Connection downlink estimate |
| `effectiveType` | `string \| undefined` | Effective connection type such as `4g` |
| `rtt` | `number \| undefined` | Round-trip time estimate |
| `saveData` | `boolean \| undefined` | Whether the user enabled data saver |

### `useIsOnline()`

Returns a single `boolean` for components that only need online/offline state.

## Notes

- Connection metadata depends on the browser Network Information API and may be unavailable.
- The hook is safe for SSR and initializes from `navigator.onLine` when available.

## License

MIT © Input Kit

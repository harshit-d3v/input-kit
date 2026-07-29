# @input-kit/tabs

Accessible compound tabs for React with roving focus and controlled or uncontrolled state.

## Installation

```bash
npm install @input-kit/tabs
```

## Features

- Proper `tab`, `tablist`, and `tabpanel` relationships
- Arrow key navigation with Home and End support
- Automatic or manual activation modes
- Horizontal and vertical layouts
- Optional `forceMount` panels for preserving state

## Usage

```tsx
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@input-kit/tabs';

function Example() {
	return (
		<Tabs activationMode="manual">
			<TabList aria-label="Sections">
				<Tab>Overview</Tab>
				<Tab>API</Tab>
				<Tab disabled>Locked</Tab>
			</TabList>
			<TabPanels>
				<TabPanel>Overview content</TabPanel>
				<TabPanel>API content</TabPanel>
				<TabPanel forceMount>Locked content</TabPanel>
			</TabPanels>
		</Tabs>
	);
}
```

## Notes

- Use `selectedIndex` and `onChange` for controlled tabs.
- `activationMode="automatic"` activates on focus; `manual` waits for Enter or Space.
- Disabled tabs are skipped by keyboard navigation.

## License

MIT © Input Kit

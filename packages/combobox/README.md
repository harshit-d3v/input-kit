# @input-kit/combobox

A flexible, accessible autocomplete/combobox component for React with async loading, multi-select, and keyboard navigation support.

## Features

- **Autocomplete** — Filter options as user types
- **Async Loading** — Load options from API with debouncing
- **Multi-Select** — Select multiple items with tag display
- **Creatable** — Allow creating new options
- **Keyboard Navigation** — Full keyboard support (Arrow keys, Enter, Escape, etc.)
- **Accessibility** — ARIA combobox pattern implementation
- **Clearable** — Clear selection with one click
- **Headless Hook** — `useCombobox` hook for custom UI
- **TypeScript** — Full type safety

## Installation

```bash
npm install @input-kit/combobox
```

## Quick Start

### Basic Usage

```tsx
import { Combobox } from '@input-kit/combobox';
import { useState } from 'react';

const options = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
];

function App() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Select a fruit..."
    />
  );
}
```

### Async Loading

```tsx
import { Combobox } from '@input-kit/combobox';
import { useState } from 'react';

function App() {
  const [value, setValue] = useState<string | null>(null);

  const loadOptions = async (query: string) => {
    const response = await fetch(`/api/fruits?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      label: item.name,
    }));
  };

  return (
    <Combobox
      loadOptions={loadOptions}
      value={value}
      onChange={setValue}
      debounceMs={300}
      placeholder="Search fruits..."
    />
  );
}
```

### Multi-Select

```tsx
import { Combobox } from '@input-kit/combobox';
import { useState } from 'react';

const options = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
];

function App() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      multi
      placeholder="Select fruits..."
    />
  );
}
```

### Creatable (Allow New Options)

```tsx
import { Combobox } from '@input-kit/combobox';
import { useState } from 'react';

const options = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
];

function App() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      creatable
      createLabel={(input) => `Add "${input}"`}
      placeholder="Select or type..."
    />
  );
}
```

## API Reference

### Combobox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `ComboboxOption<T>[]` | - | Static options array (mutually exclusive with `loadOptions`) |
| `loadOptions` | `(query: string) => Promise<ComboboxOption<T>[]>` | - | Async function to load options (mutually exclusive with `options`) |
| `value` | `T \| T[] \| null` | - | Current selected value(s) |
| `onChange` | `(value: T \| T[] \| null) => void` | - | Callback when selection changes |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the combobox |
| `multi` | `boolean` | `false` | Enable multi-select mode |
| `creatable` | `boolean` | `false` | Allow creating new options |
| `createLabel` | `(inputValue: string) => string` | - | Custom label for create option |
| `clearInputOnSelect` | `boolean` | `!multi` | Clear input after selection |
| `filterFn` | `(option, inputValue) => boolean` | - | Custom filter function |
| `renderValue` | `(value, option) => ReactNode` | - | Custom render for selected values |
| `renderOption` | `(option, isHighlighted, isSelected) => ReactNode` | - | Custom render for options |
| `onInputChange` | `(value: string) => void` | - | Callback when input changes |
| `debounceMs` | `number` | `300` | Debounce delay for async loading |
| `loading` | `boolean` | `false` | External loading state |
| `loadingComponent` | `ReactNode` | - | Custom loading indicator |
| `clearable` | `boolean` | `false` | Show clear button |
| `id` | `string` | - | ID for accessibility |
| `aria-label` | `string` | - | Accessible label |
| `aria-labelledby` | `string` | - | ID of element labeling the combobox |
| `className` | `string` | - | CSS class for the container |

### ComboboxOption Type

```typescript
interface ComboboxOption<T = unknown> {
  id: string;           // Unique identifier
  label: string;        // Display label
  value?: T;            // Optional custom value (defaults to id)
  disabled?: boolean;   // Disable this option
  render?: (option, isHighlighted, isSelected) => ReactNode; // Custom render
}
```

### useCombobox Hook

For custom UI implementations, use the `useCombobox` hook:

```tsx
import { useCombobox } from '@input-kit/combobox';

function CustomCombobox() {
  const {
    inputProps,
    listboxProps,
    isOpen,
    highlightedIndex,
    filteredOptions,
    selectOption,
    isSelected,
    getOptionId,
  } = useCombobox({
    options: [
      { id: '1', label: 'Option 1' },
      { id: '2', label: 'Option 2' },
    ],
    value: selectedValue,
    onChange: setSelectedValue,
  });

  return (
    <div>
      <input {...inputProps} />
      {isOpen && (
        <ul {...listboxProps}>
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              id={getOptionId(index)}
              role="option"
              aria-selected={isSelected(option)}
              onClick={() => selectOption(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### useCombobox Return Values

| Property | Type | Description |
|----------|------|-------------|
| `inputProps` | `object` | Props to spread on the input element |
| `listboxProps` | `object` | Props to spread on the listbox element |
| `isOpen` | `boolean` | Whether the dropdown is open |
| `highlightedIndex` | `number` | Currently highlighted option index |
| `filteredOptions` | `ComboboxOption<T>[]` | Filtered/loaded options |
| `selectOption` | `(index: number) => void` | Select an option by index |
| `highlightOption` | `(index: number) => void` | Highlight an option by index |
| `clearSelection` | `() => void` | Clear the selection |
| `open` | `() => void` | Open the dropdown |
| `close` | `() => void` | Close the dropdown |
| `toggle` | `() => void` | Toggle the dropdown |
| `inputValue` | `string` | Current input value |
| `setInputValue` | `(value: string) => void` | Set input value |
| `isLoading` | `boolean` | Whether options are loading |
| `isSelected` | `(option) => boolean` | Check if an option is selected |
| `getOptionId` | `(index: number) => string` | Get ID for option element |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↓` | Open dropdown / Navigate down |
| `↑` | Navigate up |
| `Enter` | Select highlighted option |
| `Escape` | Close dropdown / Clear input |
| `Home` | Go to first option (with Ctrl) |
| `End` | Go to last option (with Ctrl) |
| `Tab` | Select highlighted and blur |
| `Backspace` | Remove last tag (multi, empty input) |

## Accessibility

This component implements the [ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/):

- Input has `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant`
- Listbox has `role="listbox"` with `aria-multiselectable` when applicable
- Options have `role="option"` with `aria-selected`
- Live region announces available options count

## Styling

The component provides CSS class names for styling:

```css
.combobox                    /* Container */
.combobox--open             /* When dropdown is open */
.combobox--disabled         /* When disabled */
.combobox--multi            /* Multi-select mode */
.combobox__control          /* Input container */
.combobox__input            /* Input element */
.combobox__tags             /* Tags container (multi) */
.combobox__tag             /* Individual tag */
.combobox__tag-remove      /* Tag remove button */
.combobox__clear           /* Clear button */
.combobox__indicator        /* Dropdown indicator */
.combobox__menu            /* Dropdown menu */
.combobox__listbox         /* Options list */
.combobox__loading         /* Loading state */
.combobox__empty           /* Empty state */
.combobox-option           /* Option item */
.combobox-option--highlighted  /* Highlighted option */
.combobox-option--selected     /* Selected option */
.combobox-option--disabled     /* Disabled option */
.combobox-option__highlight    /* Highlighted match text */
```

## License

MIT © Input Kit

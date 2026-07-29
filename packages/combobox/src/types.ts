import type { ReactNode, InputHTMLAttributes, HTMLAttributes } from 'react';

/**
 * Option type for combobox
 */
export interface ComboboxOption<T = unknown> {
  /** Unique identifier for the option */
  id: string;
  /** Display label */
  label: string;
  /** Optional value (defaults to id) */
  value?: T;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Custom render for the option */
  render?: (option: ComboboxOption<T>, isHighlighted: boolean, isSelected: boolean) => ReactNode;
}

/**
 * Base props for combobox
 */
export interface BaseComboboxProps<T = unknown> {
  /** Current value (single or array for multi-select) */
  value: T | T[] | null;
  /** Callback when selection changes */
  onChange: (value: T | T[] | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Whether to allow multiple selections */
  multi?: boolean;
  /** Whether to allow creating new options */
  creatable?: boolean;
  /** Custom create option label */
  createLabel?: (inputValue: string) => string;
  /** Whether to clear input after selection (single select only) */
  clearInputOnSelect?: boolean;
  /** Custom filter function */
  filterFn?: (option: ComboboxOption<T>, inputValue: string) => boolean;
  /** Custom render for selected values */
  renderValue?: (value: T, option?: ComboboxOption<T>) => ReactNode;
  /** Custom render for options */
  renderOption?: (option: ComboboxOption<T>, isHighlighted: boolean, isSelected: boolean) => ReactNode;
  /** Callback when input value changes */
  onInputChange?: (value: string) => void;
  /** Debounce delay for async loading (ms) */
  debounceMs?: number;
  /** Whether the combobox is in loading state */
  loading?: boolean;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Whether to show clear button */
  clearable?: boolean;
  /** ID for accessibility */
  id?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Accessible labelledby */
  'aria-labelledby'?: string;
  /** Custom className */
  className?: string;
}

/**
 * Props for combobox with static options
 */
export interface StaticComboboxProps<T = unknown> extends BaseComboboxProps<T> {
  /** Static options array */
  options: ComboboxOption<T>[];
  loadOptions?: never;
}

/**
 * Props for combobox with async loading
 */
export interface AsyncComboboxProps<T = unknown> extends BaseComboboxProps<T> {
  /** Async function to load options */
  loadOptions: (query: string) => Promise<ComboboxOption<T>[]> | ComboboxOption<T>[];
  options?: never;
}

/**
 * Combined combobox props
 */
export type ComboboxProps<T = unknown> = StaticComboboxProps<T> | AsyncComboboxProps<T>;

/**
 * Return type for useCombobox hook
 */
export interface UseComboboxReturn<T = unknown> {
  /** Props for the input element */
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'ref'> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    role: 'combobox';
    'aria-expanded': boolean;
    'aria-controls': string | undefined;
    'aria-activedescendant': string | undefined;
    'aria-autocomplete': 'list';
    autoComplete: 'off';
  };
  /** Ref for the input element */
  inputRef: React.RefObject<HTMLInputElement>;
  /** Props for the listbox element */
  listboxProps: Omit<HTMLAttributes<HTMLUListElement>, 'role' | 'ref'> & {
    role: 'listbox';
    id: string | undefined;
    'aria-multiselectable': boolean;
  };
  /** Ref for the listbox element */
  listboxRef: React.RefObject<HTMLUListElement>;
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Currently highlighted index */
  highlightedIndex: number;
  /** Currently filtered options */
  filteredOptions: ComboboxOption<T>[];
  /** Select an option by index */
  selectOption: (index: number) => void;
  /** Highlight an option by index */
  highlightOption: (index: number) => void;
  /** Clear the selection */
  clearSelection: () => void;
  /** Open the dropdown */
  open: () => void;
  /** Close the dropdown */
  close: () => void;
  /** Toggle the dropdown */
  toggle: () => void;
  /** Current input value */
  inputValue: string;
  /** Set input value */
  setInputValue: (value: string) => void;
  /** Whether options are loading */
  isLoading: boolean;
  /** Whether an option is selected */
  isSelected: (option: ComboboxOption<T>) => boolean;
  /** Get ID for option element */
  getOptionId: (index: number) => string;
}

/**
 * Props for useCombobox hook
 */
export interface UseComboboxProps<T = unknown> {
  /** Static options */
  options?: ComboboxOption<T>[];
  /** Async loader function */
  loadOptions?: (query: string) => Promise<ComboboxOption<T>[]> | ComboboxOption<T>[];
  /** Current value */
  value: T | T[] | null;
  /** Change handler */
  onChange: (value: T | T[] | null) => void;
  /** Whether multi-select */
  multi?: boolean;
  /** Whether creatable */
  creatable?: boolean;
  /** Custom create label */
  createLabel?: (inputValue: string) => string;
  /** Whether to clear input on select */
  clearInputOnSelect?: boolean;
  /** Custom filter function */
  filterFn?: (option: ComboboxOption<T>, inputValue: string) => boolean;
  /** Debounce delay */
  debounceMs?: number;
  /** External loading state */
  loading?: boolean;
  /** Callback on input change */
  onInputChange?: (value: string) => void;
  /** ID prefix for accessibility */
  id?: string;
}

/**
 * Props for ComboboxOption component
 */
export interface ComboboxOptionProps<T = unknown> {
  /** The option data */
  option: ComboboxOption<T>;
  /** Whether this option is highlighted */
  isHighlighted: boolean;
  /** Whether this option is selected */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Mouse enter handler */
  onMouseEnter: () => void;
  /** Custom render function */
  render?: (option: ComboboxOption<T>, isHighlighted: boolean, isSelected: boolean) => ReactNode;
  /** ID for accessibility */
  id?: string;
  /** Role */
  role?: string;
  /** Aria selected */
  'aria-selected'?: boolean;
}

/**
 * Utility type for highlighting matched text
 */
export interface HighlightMatch {
  text: string;
  isMatch: boolean;
}

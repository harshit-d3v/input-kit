import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCombobox } from './useCombobox.js';
import type { ComboboxOption, UseComboboxProps } from './types.js';

const options: ComboboxOption<string>[] = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
  { id: '4', label: 'Date' },
];

describe('useCombobox', () => {
  const defaultProps: UseComboboxProps<string> = {
    options,
    value: null,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    it('initializes with closed dropdown', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.inputValue).toBe('');
      expect(result.current.highlightedIndex).toBe(0);
    });

    it('opens dropdown', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.open();
      });
      
      expect(result.current.isOpen).toBe(true);
    });

    it('closes dropdown', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.open();
        result.current.close();
      });
      
      expect(result.current.isOpen).toBe(false);
    });

    it('toggles dropdown', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);
      
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('input handling', () => {
    it('updates input value', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.setInputValue('app');
      });
      
      expect(result.current.inputValue).toBe('app');
    });

    it('calls onInputChange when input changes', () => {
      const onInputChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, onInputChange })
      );
      
      act(() => {
        result.current.setInputValue('test');
      });
      
      expect(onInputChange).toHaveBeenCalledWith('test');
    });

    it('filters options based on input', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.setInputValue('app');
      });
      
      expect(result.current.filteredOptions).toHaveLength(1);
      expect(result.current.filteredOptions[0].label).toBe('Apple');
    });
  });

  describe('selection', () => {
    it('selects single option', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, onChange })
      );
      
      act(() => {
        result.current.open();
        result.current.selectOption(0);
      });
      
      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('clears input after selection by default', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, onChange })
      );
      
      act(() => {
        result.current.setInputValue('app');
        result.current.open();
        result.current.selectOption(0);
      });
      
      expect(result.current.inputValue).toBe('');
    });

    it('keeps input after selection when clearInputOnSelect is false', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, onChange, clearInputOnSelect: false })
      );
      
      act(() => {
        result.current.setInputValue('app');
        result.current.open();
        result.current.selectOption(0);
      });
      
      expect(result.current.inputValue).toBe('Apple');
    });

    it('clears selection', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, onChange, value: '1' })
      );
      
      act(() => {
        result.current.clearSelection();
      });
      
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('multi-select', () => {
    const multiProps: UseComboboxProps<string> = {
      ...defaultProps,
      multi: true,
      value: [],
    };

    it('adds value to array on select', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...multiProps, onChange })
      );
      
      act(() => {
        result.current.open();
        result.current.selectOption(0);
      });
      
      expect(onChange).toHaveBeenCalledWith(['1']);
    });

    it('removes value if already selected', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...multiProps, onChange, value: ['1', '2'] })
      );
      
      act(() => {
        result.current.open();
        result.current.selectOption(0);
      });
      
      expect(onChange).toHaveBeenCalledWith(['2']);
    });

    it('keeps dropdown open after selection', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...multiProps, onChange })
      );
      
      act(() => {
        result.current.open();
        result.current.selectOption(0);
      });
      
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('keyboard navigation', () => {
    it('opens dropdown on ArrowDown', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'ArrowDown',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(result.current.isOpen).toBe(true);
    });

    it('navigates down with ArrowDown', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.open();
      });
      
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'ArrowDown',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(result.current.highlightedIndex).toBe(1);
    });

    it('navigates up with ArrowUp', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.open();
        result.current.highlightOption(2);
      });
      
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'ArrowUp',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(result.current.highlightedIndex).toBe(1);
    });

    it('selects on Enter', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, onChange })
      );
      
      act(() => {
        result.current.open();
      });
      
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('closes on Escape', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      act(() => {
        result.current.open();
      });
      
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'Escape',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(result.current.isOpen).toBe(false);
    });

    it('clears input on Escape when closed', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      // Set input value directly
      act(() => {
        result.current.setInputValue('test');
      });
      
      // Close dropdown (in case it's open)
      act(() => {
        result.current.close();
      });
      
      // Verify dropdown is closed
      expect(result.current.isOpen).toBe(false);
      
      // Press Escape to clear input
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'Escape',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      // Input should be cleared
      expect(result.current.inputValue).toBe('');
    });

    it('removes last tag on Backspace when input is empty (multi)', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => 
        useCombobox({ 
          ...defaultProps, 
          multi: true, 
          value: ['1', '2'],
          onChange 
        })
      );
      
      act(() => {
        result.current.inputProps.onKeyDown({
          key: 'Backspace',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith(['1']);
    });
  });

  describe('async loading', () => {
    it('loads options asynchronously', async () => {
      const loadOptions = vi.fn().mockResolvedValue([
        { id: '5', label: 'Elderberry' },
      ]);
      
      const { result } = renderHook(() => 
        useCombobox({
          value: null,
          onChange: vi.fn(),
          loadOptions,
          debounceMs: 100,
        })
      );
      
      act(() => {
        result.current.open();
      });
      
      act(() => {
        result.current.setInputValue('eld');
      });

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Wait for the promise to resolve
      await act(async () => {
        await Promise.resolve();
      });
      
      await waitFor(() => {
        expect(result.current.filteredOptions).toHaveLength(1);
        expect(result.current.filteredOptions[0].label).toBe('Elderberry');
      });
    });
  });

  describe('creatable', () => {
    it('adds creatable option when input does not match', () => {
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, creatable: true })
      );
      
      act(() => {
        result.current.setInputValue('New Fruit');
      });
      
      const creatableOption = result.current.filteredOptions.find(
        opt => opt.id.startsWith('__create__')
      );
      
      expect(creatableOption).toBeDefined();
      expect(creatableOption?.label).toBe('Create "New Fruit"');
    });

    it('does not add creatable option when input matches existing', () => {
      const { result } = renderHook(() => 
        useCombobox({ ...defaultProps, creatable: true })
      );
      
      act(() => {
        result.current.setInputValue('Apple');
      });
      
      const creatableOption = result.current.filteredOptions.find(
        opt => opt.id.startsWith('__create__')
      );
      
      expect(creatableOption).toBeUndefined();
    });
  });

  describe('accessibility', () => {
    it('provides correct aria attributes', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      expect(result.current.inputProps.role).toBe('combobox');
      expect(result.current.inputProps['aria-autocomplete']).toBe('list');
      expect(result.current.inputProps.autoComplete).toBe('off');
    });

    it('provides listbox props', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      expect(result.current.listboxProps.role).toBe('listbox');
      expect(result.current.listboxProps.id).toBeDefined();
    });

    it('generates option IDs', () => {
      const { result } = renderHook(() => useCombobox(defaultProps));
      
      expect(result.current.getOptionId(0)).toMatch(/-option-0$/);
      expect(result.current.getOptionId(5)).toMatch(/-option-5$/);
    });
  });
});

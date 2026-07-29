import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePinInput } from './usePinInput';

describe('usePinInput', () => {
  const defaultOptions = {
    length: 4,
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct values', () => {
    const { result } = renderHook(() => usePinInput(defaultOptions));
    
    expect(result.current.values).toEqual(['', '', '', '']);
    expect(result.current.isComplete).toBe(false);
  });

  it('initializes with provided value', () => {
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, value: '12' })
    );
    
    expect(result.current.values).toEqual(['1', '2', '', '']);
  });

  it('sets value at specific index', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, onChange })
    );
    
    act(() => {
      result.current.setValue(0, '5');
    });
    
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('sets entire value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, onChange })
    );
    
    act(() => {
      result.current.setValues('1234');
    });
    
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('clears all values', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, value: '1234', onChange })
    );
    
    act(() => {
      result.current.clear();
    });
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('detects when complete', () => {
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, value: '1234' })
    );
    
    expect(result.current.isComplete).toBe(true);
  });

  it('calls onComplete when all inputs filled', () => {
    const onComplete = vi.fn();
    const onChange = vi.fn();
    
    // Use a wrapper to simulate state updates
    const { result, rerender } = renderHook(
      ({ value }) => usePinInput({
        ...defaultOptions,
        value,
        onChange,
        onComplete,
      }),
      { initialProps: { value: '' } }
    );
    
    // Simulate filling the inputs by updating the value prop
    rerender({ value: '1234' });
    
    // onComplete should be called
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('handles alphanumeric input', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePinInput({
        ...defaultOptions,
        alphanumeric: true,
        onChange,
      })
    );
    
    act(() => {
      result.current.setValues('AB12');
    });
    
    expect(onChange).toHaveBeenCalledWith('AB12');
  });

  it('filters invalid characters for numeric input', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, onChange })
    );
    
    act(() => {
      result.current.setValues('12AB34');
    });
    
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('uses custom validation', () => {
    const onChange = vi.fn();
    const validate = (char: string) => char >= '5' && char <= '9';
    
    const { result } = renderHook(() =>
      usePinInput({ ...defaultOptions, validate, onChange })
    );
    
    act(() => {
      result.current.setValues('123456');
    });
    
    // Only 5 and 6 are valid (>=5 and <=9), so result is '56'
    expect(onChange).toHaveBeenCalledWith('56');
  });

  describe('handlers', () => {
    it('handles change event', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePinInput({ ...defaultOptions, onChange })
      );
      
      act(() => {
        result.current.handlers.onChange(0, {
          target: { value: '5' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('5');
    });

    it('handles backspace key', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePinInput({ ...defaultOptions, value: '1234', onChange })
      );
      
      act(() => {
        result.current.handlers.onKeyDown(3, {
          key: 'Backspace',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('123');
    });

    it('handles delete key', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePinInput({ ...defaultOptions, value: '1234', onChange })
      );
      
      act(() => {
        result.current.handlers.onKeyDown(0, {
          key: 'Delete',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('234');
    });

    it('handles paste event', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePinInput({ ...defaultOptions, onChange })
      );
      
      act(() => {
        result.current.handlers.onPaste(0, {
          preventDefault: vi.fn(),
          clipboardData: {
            getData: () => '1234',
          },
        } as unknown as React.ClipboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('1234');
    });

    it('handles alphanumeric paste', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePinInput({ ...defaultOptions, alphanumeric: true, onChange })
      );
      
      act(() => {
        result.current.handlers.onPaste(0, {
          preventDefault: vi.fn(),
          clipboardData: {
            getData: () => 'AB12',
          },
        } as unknown as React.ClipboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('AB12');
    });

    it('filters invalid characters from paste', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePinInput({ ...defaultOptions, onChange })
      );
      
      act(() => {
        result.current.handlers.onPaste(0, {
          preventDefault: vi.fn(),
          clipboardData: {
            getData: () => '12AB34',
          },
        } as unknown as React.ClipboardEvent<HTMLInputElement>);
      });
      
      expect(onChange).toHaveBeenCalledWith('1234');
    });
  });

  describe('uncontrolled mode', () => {
    it('works without onChange', () => {
      const { result } = renderHook(() =>
        usePinInput({ length: 4 })
      );
      
      expect(result.current.values).toEqual(['', '', '', '']);
      
      act(() => {
        result.current.setValue(0, '5');
      });
      
      expect(result.current.values).toEqual(['5', '', '', '']);
    });

    it('can clear in uncontrolled mode', () => {
      const { result } = renderHook(() =>
        usePinInput({ length: 4 })
      );
      
      act(() => {
        result.current.setValues('1234');
      });
      
      expect(result.current.isComplete).toBe(true);
      
      act(() => {
        result.current.clear();
      });
      
      expect(result.current.values).toEqual(['', '', '', '']);
      expect(result.current.isComplete).toBe(false);
    });
  });
});

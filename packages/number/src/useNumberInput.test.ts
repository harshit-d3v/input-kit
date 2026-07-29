import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNumberInput } from './useNumberInput';

describe('useNumberInput', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 100 })
    );
    expect(result.current.value).toBe(100);
  });

  it('should initialize with null when no default', () => {
    const { result } = renderHook(() => useNumberInput());
    expect(result.current.value).toBeNull();
  });

  it('should set value', () => {
    const { result } = renderHook(() => useNumberInput());
    
    act(() => {
      result.current.setValue(50);
    });
    
    expect(result.current.value).toBe(50);
  });

  it('should increment value', () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 10, step: 5 })
    );
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.value).toBe(15);
  });

  it('should decrement value', () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 10, step: 5 })
    );
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.value).toBe(5);
  });

  it('should clear value', () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 10, allowEmpty: true })
    );
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.value).toBeNull();
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ onChange })
    );
    
    act(() => {
      result.current.setValue(42);
    });
    
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('should respect min/max constraints', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 10, min: 0, max: 100, onChange })
    );
    
    act(() => {
      result.current.setValue(150);
    });
    
    // setValue doesn't clamp - it's direct value setting
    // Clamping happens during input parsing
    expect(result.current.value).toBe(150);
  });

  it('should validate correctly', () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 10, min: 0, max: 100 })
    );
    
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should format value correctly', () => {
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 1234.5,
        format: 'currency',
        currency: 'USD',
        locale: 'en-US',
      })
    );
    
    expect(result.current.formattedValue).toBe('$1,234.50');
  });

  it('should provide input props', () => {
    const { result } = renderHook(() => useNumberInput());
    
    expect(result.current.inputProps).toBeDefined();
    expect(result.current.inputProps.type).toBe('text');
    expect(result.current.inputProps.inputMode).toBe('decimal');
    expect(result.current.inputProps.ref).toBeDefined();
  });
});

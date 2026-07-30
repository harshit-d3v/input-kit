import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useOtpInput, OtpInput } from './index';

describe('useOtpInput.setValue', () => {
  // setValue truncated before filtering, so a separator ate a real character.
  // handlePaste always did it the other way round; the two disagreed.
  it('filters before truncating, so separators do not eat digits', () => {
    const { result } = renderHook(() => useOtpInput({ length: 4, type: 'numeric' }));
    act(() => result.current.setValue('12-345'));
    expect(result.current.value.join('')).toBe('1234');
  });

  it('drops characters that fail the type pattern', () => {
    const { result } = renderHook(() => useOtpInput({ length: 6, type: 'numeric' }));
    act(() => result.current.setValue('1a2b3c'));
    expect(result.current.value.join('')).toBe('123');
  });

  it('uppercases for alphanumeric', () => {
    const { result } = renderHook(() => useOtpInput({ length: 4, type: 'alphanumeric' }));
    act(() => result.current.setValue('ab12'));
    expect(result.current.value.join('')).toBe('AB12');
  });

  it('pads to length', () => {
    const { result } = renderHook(() => useOtpInput({ length: 6, type: 'numeric' }));
    act(() => result.current.setValue('12'));
    expect(result.current.value).toHaveLength(6);
    expect(result.current.value.slice(2).every((c) => c === '')).toBe(true);
  });
});

describe('notification callbacks', () => {
  it('does not fire on mount', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    renderHook(() => useOtpInput({ length: 4, onChange, onComplete }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('fires onComplete once, not on every subsequent render', () => {
    // The defect: inline callbacks sat in the effect's dependency array, so a filled
    // OTP re-fired onComplete on every render — and onComplete is what consumers use
    // to submit.
    const onComplete = vi.fn();

    function Harness() {
      const [, force] = useState(0);
      const otp = useOtpInput({ length: 4, type: 'numeric', onComplete: (v) => onComplete(v) });
      return (
        <>
          <button onClick={() => otp.setValue('1234')}>fill</button>
          <button onClick={() => force((n) => n + 1)}>rerender</button>
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByText('fill'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');

    fireEvent.click(screen.getByText('rerender'));
    fireEvent.click(screen.getByText('rerender'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reports the value through onChange when it changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useOtpInput({ length: 4, type: 'numeric', onChange }));
    act(() => result.current.setValue('12'));
    expect(onChange).toHaveBeenLastCalledWith('12');
  });
});

describe('length changes', () => {
  it('re-pads the value array so inputs never go uncontrolled', () => {
    // The array was sized once by the useState initialiser, so growing `length`
    // rendered inputs whose value[index] was undefined.
    const { result, rerender } = renderHook(
      ({ length }) => useOtpInput({ length, type: 'numeric' }),
      { initialProps: { length: 4 } }
    );
    act(() => result.current.setValue('1234'));
    rerender({ length: 6 });
    expect(result.current.value).toHaveLength(6);
    expect(result.current.value.every((c) => typeof c === 'string')).toBe(true);
    expect(result.current.value.join('')).toBe('1234');
  });

  it('shrinks without leaving stragglers', () => {
    const { result, rerender } = renderHook(
      ({ length }) => useOtpInput({ length, type: 'numeric' }),
      { initialProps: { length: 6 } }
    );
    act(() => result.current.setValue('123456'));
    rerender({ length: 4 });
    expect(result.current.value).toHaveLength(4);
    expect(result.current.value.join('')).toBe('1234');
  });
});

describe('isComplete', () => {
  it('is false until every cell is filled', () => {
    const { result } = renderHook(() => useOtpInput({ length: 4, type: 'numeric' }));
    act(() => result.current.setValue('123'));
    expect(result.current.isComplete).toBe(false);
    act(() => result.current.setValue('1234'));
    expect(result.current.isComplete).toBe(true);
  });
});

describe('OtpInput component', () => {
  it('renders one labelled input per digit inside a group', () => {
    render(<OtpInput length={4} />);
    expect(screen.getByRole('group')).toBeTruthy();
    expect(screen.getByLabelText('Digit 1 of 4')).toBeTruthy();
    expect(screen.getByLabelText('Digit 4 of 4')).toBeTruthy();
  });

  it('converges on a controlled value containing separators', () => {
    // setValue filters, so comparing the raw prop against the stored value meant
    // "12-34" never matched and the sync effect re-fired forever.
    expect(() => render(<OtpInput length={4} value="12-34" type="numeric" />)).not.toThrow();
    expect((screen.getByLabelText('Digit 1 of 4') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Digit 4 of 4') as HTMLInputElement).value).toBe('4');
  });

  it('masks when asked', () => {
    render(<OtpInput length={4} masked />);
    expect((screen.getByLabelText('Digit 1 of 4') as HTMLInputElement).type).toBe('password');
  });
});

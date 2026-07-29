import { forwardRef, useImperativeHandle } from 'react';
import type { PinInputProps } from './types';
import { usePinInput } from './usePinInput';

export interface PinInputRef {
  /** Clear all inputs */
  clear: () => void;
  /** Focus a specific input */
  focus: (index?: number) => void;
}

/**
 * PIN Input component for numeric codes
 * 
 * @example
 * ```tsx
 * <PinInput
 *   length={4}
 *   value={pin}
 *   onChange={setPin}
 *   mask
 *   onComplete={(code) => console.log('Complete:', code)}
 * />
 * ```
 */
export const PinInput = forwardRef<PinInputRef, PinInputProps>(
  (
    {
      length,
      value,
      onChange,
      onComplete,
      mask = false,
      placeholder = '',
      disabled = false,
      readOnly = false,
      validate,
      className = '',
      inputClassName = '',
      autoFocus = false,
    },
    ref
  ) => {
    const { values, handlers, inputRefs, clear, focusInput } = usePinInput({
      length,
      value,
      onChange,
      onComplete,
      alphanumeric: false,
      validate,
      autoFocus,
    });

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      clear,
      focus: (index = 0) => focusInput(index),
    }));

    return (
      <div
        className={`pin-input-container ${className}`}
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        {values.map((char, index) => (
          <input
            key={index}
            ref={(el) => {
              if (inputRefs.current) {
                inputRefs.current[index] = el;
              }
            }}
            type={mask ? 'password' : 'text'}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={char}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => handlers.onChange(index, e)}
            onKeyDown={(e) => handlers.onKeyDown(index, e)}
            onPaste={(e) => handlers.onPaste(index, e)}
            onFocus={(e) => handlers.onFocus(index, e)}
            className={`pin-input-field ${inputClassName}`}
            style={{
              width: '2.5rem',
              height: '3rem',
              textAlign: 'center',
              fontSize: '1.25rem',
              border: '1px solid #ccc',
              borderRadius: '0.375rem',
              outline: 'none',
            }}
            aria-label={`PIN digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
    );
  }
);

PinInput.displayName = 'PinInput';

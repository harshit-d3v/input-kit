import { forwardRef, useImperativeHandle } from 'react';
import type { OtpInputProps } from './types';
import { usePinInput } from './usePinInput';

export interface OtpInputRef {
  /** Clear all inputs */
  clear: () => void;
  /** Focus a specific input */
  focus: (index?: number) => void;
}

/**
 * OTP Input component for alphanumeric codes
 * 
 * @example
 * ```tsx
 * <OtpInput
 *   length={6}
 *   value={otp}
 *   onChange={setOtp}
 *   alphanumeric
 *   onComplete={(code) => verify(code)}
 * />
 * ```
 */
export const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(
  (
    {
      length,
      value,
      onChange,
      onComplete,
      mask = false,
      alphanumeric = false,
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
      alphanumeric,
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
        className={`otp-input-container ${className}`}
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
            inputMode={alphanumeric ? 'text' : 'numeric'}
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
            className={`otp-input-field ${inputClassName}`}
            style={{
              width: '2.5rem',
              height: '3rem',
              textAlign: 'center',
              fontSize: '1.25rem',
              textTransform: alphanumeric ? 'uppercase' : 'none',
              border: '1px solid #ccc',
              borderRadius: '0.375rem',
              outline: 'none',
            }}
            aria-label={`OTP character ${index + 1} of ${length}`}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';

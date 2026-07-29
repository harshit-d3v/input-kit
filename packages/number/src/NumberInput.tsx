import { forwardRef, useImperativeHandle } from 'react';
import { useNumberInput } from './useNumberInput';
import type { NumberInputProps } from './types';


export interface NumberInputRef {
  /** Focus the input */
  focus: () => void;
  /** Blur the input */
  blur: () => void;
  /** Clear the input */
  clear: () => void;
  /** Increment the value */
  increment: () => void;
  /** Decrement the value */
  decrement: () => void;
}

/**
 * NumberInput component - headless number input with formatting
 * 
 * @example
 * ```tsx
 * <NumberInput
 *   value={value}
 *   onChange={setValue}
 *   format="currency"
 *   currency="USD"
 * />
 * ```
 */
export const NumberInput = forwardRef<NumberInputRef, NumberInputProps>(
  function NumberInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      className,
      placeholder,
      disabled,
      readOnly,
      name,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...options
    } = props;

    const {
      inputProps,
      increment,
      decrement,
      clear,
      focus,
      blur,
      isValid,
      error,
    } = useNumberInput({
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      ...options,
    });

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      focus,
      blur,
      clear,
      increment,
      decrement,
    }));

    return (
      <input
        {...inputProps}
        id={id}
        name={name}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-valid={isValid}
        data-error={error ?? undefined}
      />
    );
  }
);

export default NumberInput;

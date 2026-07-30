// @input-kit/mask - Input masking component

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
} from 'react';

// Types
export type MaskChar = string | RegExp;

export interface MaskDefinition {
  pattern: MaskChar[];
  placeholder?: string;
}

export interface UseMaskOptions {
  mask: string | MaskChar[];
  placeholder?: string;
  guide?: boolean;
  keepCharPositions?: boolean;
  showMaskOnFocus?: boolean;
  showMaskOnHover?: boolean;
  placeholderChar?: string;
  onChange?: (value: string, rawValue: string) => void;
}

export interface UseMaskReturn {
  value: string;
  rawValue: string;
  setValue: (value: string) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleFocus: (e: FocusEvent<HTMLInputElement>) => void;
  handleBlur: (e: FocusEvent<HTMLInputElement>) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  isComplete: boolean;
}

export interface MaskedInputProps {
  mask: string | MaskChar[];
  value?: string;
  onChange?: (value: string, rawValue: string) => void;
  placeholder?: string;
  guide?: boolean;
  placeholderChar?: string;
  showMaskOnFocus?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

// Predefined masks
export const masks = {
  phone: '(999) 999-9999',
  phoneIntl: '+9 (999) 999-9999',
  ssn: '999-99-9999',
  zip: '99999',
  zipPlus4: '99999-9999',
  creditCard: '9999 9999 9999 9999',
  date: '99/99/9999',
  time: '99:99',
  time12: '99:99 AA',
  currency: '$999,999.99',
};

// Mask character definitions.
//
// `A` and `a` share a pattern but differ in casing, so they are distinct regex
// *instances* — `parseMask` copies the reference through, and `conformToMask`
// compares identity to decide whether to transform the typed character. `A` was
// documented as uppercasing since the first release but never did; the shipped
// `masks.time12` ('99:99 AA') depends on it.
const UPPERCASE_LETTER = /[a-zA-Z]/;
const LOWERCASE_LETTER = /[a-zA-Z]/;

const MASK_CHARS: Record<string, RegExp> = {
  '9': /\d/,                 // Any digit
  'a': LOWERCASE_LETTER,     // Any letter, lowercased
  'A': UPPERCASE_LETTER,     // Any letter, uppercased
  '*': /[a-zA-Z0-9]/,        // Any alphanumeric
  '#': /[0-9a-fA-F]/,        // Hex character
};

function applyMaskCasing(char: string, maskChar: MaskChar): string {
  if (maskChar === UPPERCASE_LETTER) return char.toUpperCase();
  if (maskChar === LOWERCASE_LETTER) return char.toLowerCase();
  return char;
}

// Utility functions
function parseMask(mask: string | MaskChar[]): MaskChar[] {
  if (Array.isArray(mask)) return mask;
  
  const result: MaskChar[] = [];
  let i = 0;
  
  while (i < mask.length) {
    const char = mask[i];
    
    // Escape next character with backslash
    if (char === '\\' && i + 1 < mask.length) {
      result.push(mask[i + 1]);
      i += 2;
      continue;
    }
    
    // Check if it's a mask character
    if (MASK_CHARS[char]) {
      result.push(MASK_CHARS[char]);
    } else {
      result.push(char);
    }
    
    i++;
  }
  
  return result;
}

function isEditablePosition(maskChar: MaskChar): boolean {
  return maskChar instanceof RegExp;
}

function conformToMask(
  value: string,
  mask: MaskChar[],
  options: {
    guide?: boolean;
    placeholderChar?: string;
    previousValue?: string;
    caretPosition?: number;
  } = {}
): { value: string; caretPosition: number } {
  const {
    guide = true,
    placeholderChar = '_',
    caretPosition = 0,
  } = options;
  
  let result = '';
  let valueIndex = 0;
  let newCaretPosition = caretPosition;
  
  for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
    const maskChar = mask[maskIndex];
    
    if (isEditablePosition(maskChar)) {
      // Find next valid character from input
      while (valueIndex < value.length) {
        const inputChar = value[valueIndex];
        valueIndex++;
        
        if ((maskChar as RegExp).test(inputChar)) {
          result += applyMaskCasing(inputChar, maskChar);
          break;
        }
      }
      
      // If no valid character found, add placeholder or stop
      if (result.length === maskIndex) {
        if (guide) {
          result += placeholderChar;
        } else {
          break;
        }
      }
    } else {
      // Fixed character
      result += maskChar;
      
      // Skip if input has this character
      if (value[valueIndex] === maskChar) {
        valueIndex++;
      }
    }
  }
  
  // Calculate caret position
  let inputCharsBeforeCaret = 0;
  for (let i = 0; i < caretPosition && i < value.length; i++) {
    if (/\S/.test(value[i])) inputCharsBeforeCaret++;
  }
  
  newCaretPosition = 0;
  let countedInputChars = 0;
  for (let i = 0; i < result.length; i++) {
    if (isEditablePosition(mask[i])) {
      if (result[i] !== placeholderChar) {
        countedInputChars++;
      }
      if (countedInputChars === inputCharsBeforeCaret) {
        newCaretPosition = i + 1;
        break;
      }
    }
    if (countedInputChars < inputCharsBeforeCaret) {
      newCaretPosition = i + 1;
    }
  }
  
  return { value: result, caretPosition: newCaretPosition };
}

function getRawValue(maskedValue: string, mask: MaskChar[], placeholderChar: string = '_'): string {
  let result = '';
  
  for (let i = 0; i < maskedValue.length && i < mask.length; i++) {
    if (isEditablePosition(mask[i]) && maskedValue[i] !== placeholderChar) {
      result += maskedValue[i];
    }
  }
  
  return result;
}

function isComplete(maskedValue: string, mask: MaskChar[], placeholderChar: string = '_'): boolean {
  for (let i = 0; i < mask.length; i++) {
    if (isEditablePosition(mask[i])) {
      if (i >= maskedValue.length || maskedValue[i] === placeholderChar) {
        return false;
      }
    }
  }
  return true;
}

// Hook
export function useMask(options: UseMaskOptions): UseMaskReturn {
  const {
    mask: maskInput,
    guide = true,
    placeholderChar = '_',
    onChange,
  } = options;
  
  // Memoised: `parseMask` returned a fresh array on every render, and that array is a
  // dependency of every callback below — so none of the memoisation did anything, and
  // `MaskedInput`'s sync effect (which depends on `setValue`) ran on every render.
  const mask = useMemo(() => parseMask(maskInput), [maskInput]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValueState] = useState('');
  
  const rawValue = getRawValue(value, mask, placeholderChar);
  const complete = isComplete(value, mask, placeholderChar);
  
  const setValue = useCallback((newValue: string) => {
    const { value: conformedValue } = conformToMask(newValue, mask, {
      guide,
      placeholderChar,
    });
    setValueState(conformedValue);
    onChange?.(conformedValue, getRawValue(conformedValue, mask, placeholderChar));
  }, [mask, guide, placeholderChar, onChange]);
  
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const caretPosition = e.target.selectionStart || 0;
    
    const { value: conformedValue, caretPosition: newCaretPosition } = conformToMask(
      inputValue,
      mask,
      { guide, placeholderChar, previousValue: value, caretPosition }
    );
    
    setValueState(conformedValue);
    onChange?.(conformedValue, getRawValue(conformedValue, mask, placeholderChar));
    
    // Set caret position after render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCaretPosition, newCaretPosition);
      }
    });
  }, [mask, guide, placeholderChar, value, onChange]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const caretPosition = input.selectionStart || 0;
    
    // Clearing a slot means writing the placeholder in guide mode, but simply
    // removing the character when guide mode is off — the value holds no
    // placeholders there, so splicing one in used to type a literal `_` into the
    // field every time the user pressed Backspace.
    const clearAt = (source: string, position: number) =>
      guide
        ? source.slice(0, position) + placeholderChar + source.slice(position + 1)
        : source.slice(0, position) + source.slice(position + 1);

    if (e.key === 'Backspace' && caretPosition > 0) {
      // Find previous editable position
      let targetPos = caretPosition - 1;
      while (targetPos >= 0 && !isEditablePosition(mask[targetPos])) {
        targetPos--;
      }

      if (targetPos >= 0) {
        e.preventDefault();
        const newValue = clearAt(value, targetPos);
        setValueState(newValue);
        onChange?.(newValue, getRawValue(newValue, mask, placeholderChar));

        requestAnimationFrame(() => {
          input.setSelectionRange(targetPos, targetPos);
        });
      }
    }

    if (e.key === 'Delete' && caretPosition < value.length) {
      // Find next editable position
      let targetPos = caretPosition;
      while (targetPos < mask.length && !isEditablePosition(mask[targetPos])) {
        targetPos++;
      }

      if (targetPos < mask.length) {
        e.preventDefault();
        const newValue = clearAt(value, targetPos);
        setValueState(newValue);
        onChange?.(newValue, getRawValue(newValue, mask, placeholderChar));
      }
    }
  }, [mask, value, guide, placeholderChar, onChange]);
  
  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    if (!value && guide) {
      const { value: initialValue } = conformToMask('', mask, { guide, placeholderChar });
      setValueState(initialValue);
      
      // Move caret to first editable position
      requestAnimationFrame(() => {
        const firstEditable = mask.findIndex(isEditablePosition);
        e.target.setSelectionRange(firstEditable, firstEditable);
      });
    }
  }, [value, mask, guide, placeholderChar]);
  
  const handleBlur = useCallback((_e: FocusEvent<HTMLInputElement>) => {
    // Remove guide characters if empty
    if (!guide || rawValue === '') {
      setValueState('');
    }
  }, [guide, rawValue]);
  
  return {
    value,
    rawValue,
    setValue,
    handleChange,
    handleKeyDown,
    handleFocus,
    handleBlur,
    inputRef,
    isComplete: complete,
  };
}

// Component
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  function MaskedInput(props, ref) {
    const {
      mask,
      value: controlledValue,
      onChange,
      placeholder,
      guide = true,
      placeholderChar = '_',
      showMaskOnFocus = true,
      disabled = false,
      className,
      style,
      id,
      name,
      autoFocus,
    } = props;
    
    const {
      value,
      setValue,
      handleChange,
      handleKeyDown,
      handleFocus,
      handleBlur,
      inputRef,
    } = useMask({
      mask,
      guide: showMaskOnFocus ? guide : false,
      placeholderChar,
      onChange,
    });
    
    // Sync with controlled value.
    //
    // The comparison has to conform with the *same* guide setting the hook was given.
    // It previously used the `guide` prop while the hook received
    // `showMaskOnFocus ? guide : false` — so with `showMaskOnFocus={false}` and
    // `guide` on, the two strings could never match, and the effect set state on
    // every render forever.
    const effectiveGuide = showMaskOnFocus ? guide : false;

    useEffect(() => {
      if (controlledValue === undefined) return;

      const parsedMask = parseMask(mask);
      const { value: conformedValue } = conformToMask(controlledValue, parsedMask, {
        guide: effectiveGuide,
        placeholderChar,
      });

      if (conformedValue !== value) {
        setValue(controlledValue);
      }
    }, [controlledValue, effectiveGuide, mask, placeholderChar, setValue, value]);

    const setInputRefs = useCallback((node: HTMLInputElement | null) => {
      inputRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [inputRef, ref]);
    
    return (
      <input
        ref={setInputRefs}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        id={id}
        name={name}
        autoFocus={autoFocus}
        style={{
          fontFamily: 'monospace',
          padding: '8px 12px',
          fontSize: '16px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          outline: 'none',
          ...style,
        }}
      />
    );
  }
);

// Export utilities
export { parseMask, conformToMask, getRawValue, isComplete };

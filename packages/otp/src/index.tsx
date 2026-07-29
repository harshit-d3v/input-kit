// @input-kit/otp - OTP input component

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  KeyboardEvent,
  ClipboardEvent,
  type ReactNode,
} from 'react';

// Types
export interface UseOtpInputOptions {
  length?: number;
  initialValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: 'numeric' | 'alphanumeric' | 'alpha';
  autoFocus?: boolean;
}

export interface UseOtpInputReturn {
  value: string[];
  setValue: (value: string) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleChange: (index: number, char: string) => void;
  handleKeyDown: (index: number, e: KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: ClipboardEvent<HTMLInputElement>) => void;
  handleFocus: (index: number) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  isComplete: boolean;
  clear: () => void;
}

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: 'numeric' | 'alphanumeric' | 'alpha';
  autoFocus?: boolean;
  disabled?: boolean;
  masked?: boolean;
  separator?: ReactNode;
  separatorAfter?: number[];
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  'aria-label'?: string;
}

// Validation patterns
const PATTERNS = {
  numeric: /^\d$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
  alpha: /^[a-zA-Z]$/,
};

function normalizeOtpChar(char: string, type: UseOtpInputOptions['type']) {
  return type === 'alpha' || type === 'alphanumeric' ? char.toUpperCase() : char;
}

// Hook
export function useOtpInput(options: UseOtpInputOptions = {}): UseOtpInputReturn {
  const {
    length = 6,
    initialValue = '',
    onChange,
    onComplete,
    type = 'numeric',
    autoFocus = false,
  } = options;
  
  const [value, setValueState] = useState<string[]>(() => {
    const initial = initialValue.slice(0, length).split('');
    return [...initial, ...Array(length - initial.length).fill('')];
  });
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const pattern = PATTERNS[type];
  const isComplete = value.every(char => char !== '');
  
  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < length) {
      inputRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, length]);
  
  // Notify on change
  useEffect(() => {
    const stringValue = value.join('');
    onChange?.(stringValue);
    
    if (isComplete) {
      onComplete?.(stringValue);
    }
  }, [value, isComplete, onChange, onComplete]);
  
  const setValue = useCallback((newValue: string) => {
    const chars = newValue
      .slice(0, length)
      .split('')
      .map((char) => normalizeOtpChar(char, type))
      .filter((char) => pattern.test(char));
    const padded = [...chars, ...Array(length - chars.length).fill('')];
    setValueState(padded);
  }, [length, pattern, type]);
  
  const handleChange = useCallback((index: number, char: string) => {
    if (!char) {
      setValueState(prev => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    const normalizedChar = normalizeOtpChar(char, type);
    
    if (!pattern.test(normalizedChar)) return;
    
    setValueState(prev => {
      const next = [...prev];
      next[index] = normalizedChar;
      return next;
    });
    
    // Move to next input
    if (index < length - 1) {
      setFocusedIndex(index + 1);
    }
  }, [type, pattern, length]);
  
  const handleKeyDown = useCallback((index: number, e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        setValueState(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = '';
          } else if (index > 0) {
            next[index - 1] = '';
            setFocusedIndex(index - 1);
          }
          return next;
        });
        break;
        
      case 'Delete':
        e.preventDefault();
        setValueState(prev => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (index < length - 1) {
          setFocusedIndex(index + 1);
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setFocusedIndex(length - 1);
        break;
        
      default:
        // Handle character input
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleChange(index, e.key);
        }
    }
  }, [length, handleChange]);
  
  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const validChars = pastedText
      .split('')
      .map(char => normalizeOtpChar(char, type))
      .filter(char => pattern.test(char))
      .slice(0, length);
    
    if (validChars.length > 0) {
      const newValue = [...validChars, ...Array(length - validChars.length).fill('')];
      setValueState(newValue);
      
      // Focus last filled input or next empty one
      const lastFilledIndex = validChars.length - 1;
      setFocusedIndex(Math.min(lastFilledIndex + 1, length - 1));
    }
  }, [length, pattern, type]);
  
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);
  
  const clear = useCallback(() => {
    setValueState(Array(length).fill(''));
    setFocusedIndex(0);
  }, [length]);
  
  return {
    value,
    setValue,
    focusedIndex,
    setFocusedIndex,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleFocus,
    inputRefs,
    isComplete,
    clear,
  };
}

// Component
export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(
  function OtpInput(props, ref) {
    const {
      length = 6,
      value: controlledValue,
      onChange,
      onComplete,
      type = 'numeric',
      autoFocus = false,
      disabled = false,
      masked = false,
      separator,
      separatorAfter = [],
      inputClassName,
      inputStyle,
      className,
      style,
      placeholder = '-',
      'aria-label': ariaLabel = 'OTP input',
    } = props;
    
    const {
      value,
      setValue,
      focusedIndex,
      handleChange,
      handleKeyDown,
      handlePaste,
      handleFocus,
      inputRefs,
    } = useOtpInput({
      length,
      initialValue: controlledValue,
      onChange,
      onComplete,
      type,
      autoFocus,
    });
    
    // Sync controlled value
    useEffect(() => {
      if (controlledValue !== undefined && controlledValue !== value.join('')) {
        setValue(controlledValue);
      }
    }, [controlledValue, setValue, value]);
    
    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          ...style,
        }}
      >
        {Array.from({ length }).map((_, index) => (
          <React.Fragment key={index}>
            <input
              ref={(el) => {
                if (inputRefs.current) {
                  inputRefs.current[index] = el;
                }
              }}
              type={masked ? 'password' : 'text'}
              inputMode={type === 'numeric' ? 'numeric' : 'text'}
              autoComplete="one-time-code"
              value={value[index]}
              onChange={(e) => {
                // Handle mobile keyboards that trigger onChange
                const newChar = e.target.value.slice(-1);
                handleChange(index, newChar);
              }}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              disabled={disabled}
              placeholder={placeholder}
              aria-label={`Digit ${index + 1} of ${length}`}
              className={inputClassName}
              style={{
                width: '48px',
                height: '56px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '2px solid',
                borderColor: focusedIndex === index ? '#3b82f6' : '#d1d5db',
                borderRadius: '8px',
                outline: 'none',
                background: disabled ? '#f9fafb' : 'white',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: focusedIndex === index ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                caretColor: 'transparent',
                ...inputStyle,
              }}
            />
            {separator && separatorAfter.includes(index) && (
              <span style={{ color: '#9ca3af' }}>{separator}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

// Styled variants
export function OtpInputUnderline(props: OtpInputProps) {
  return (
    <OtpInput
      {...props}
      inputStyle={{
        width: '48px',
        height: '56px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        border: 'none',
        borderBottom: '3px solid #d1d5db',
        borderRadius: 0,
        outline: 'none',
        background: 'transparent',
        transition: 'border-color 0.15s',
        ...props.inputStyle,
      }}
    />
  );
}

export function OtpInputCircle(props: OtpInputProps) {
  return (
    <OtpInput
      {...props}
      inputStyle={{
        width: '56px',
        height: '56px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        border: '2px solid #d1d5db',
        borderRadius: '50%',
        outline: 'none',
        background: 'white',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...props.inputStyle,
      }}
    />
  );
}

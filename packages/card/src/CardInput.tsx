// @input-kit/card - CardInput component

import React, { useCallback, useState, forwardRef } from 'react';
import { CardInputProps, ExpiryInputProps, CvvInputProps, CardType } from './types';
import { 
  detectCardType, 
  formatCardNumber, 
  formatExpiryDate, 
  getCardInfo,
  maskCardNumber,
  getMaxCardLength 
} from './utils';

/**
 * Card number input component
 */
export const CardInput = forwardRef<HTMLInputElement, CardInputProps>(
  function CardInput(props, ref) {
    const {
      value = '',
      onChange,
      onBlur,
      placeholder = '1234 5678 9012 3456',
      disabled = false,
      masked = false,
      showIcon = true,
      className,
      style,
      autoFocus,
      id,
      name,
      'aria-label': ariaLabel = 'Card number',
    } = props;

    const [focused, setFocused] = useState(false);
    const cardType = detectCardType(value);
    const displayValue = masked && !focused ? maskCardNumber(value) : formatCardNumber(value, cardType);
    const maxLength = getMaxCardLength(cardType);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        onChange?.(rawValue, detectCardType(rawValue));
      },
      [onChange]
    );

    const handleFocus = useCallback(() => setFocused(true), []);
    const handleBlur = useCallback(() => {
      setFocused(false);
      onBlur?.();
    }, [onBlur]);

    return (
      <div style={{ position: 'relative', display: 'inline-block', ...style }} className={className}>
        {showIcon && (
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-hidden="true"
          >
            {getCardIcon(cardType)}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          id={id}
          name={name}
          aria-label={ariaLabel}
          style={{
            paddingLeft: showIcon ? '44px' : '12px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '16px',
            fontFamily: 'monospace',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
    );
  }
);

/**
 * Expiry date input component
 */
export const ExpiryInput = forwardRef<HTMLInputElement, ExpiryInputProps>(
  function ExpiryInput(props, ref) {
    const {
      value = '',
      onChange,
      onBlur,
      placeholder = 'MM/YY',
      disabled = false,
      className,
      style,
      id,
      name,
      'aria-label': ariaLabel = 'Expiry date',
    } = props;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        if (formatted.length <= 5) {
          onChange?.(formatted);
        }
      },
      [onChange]
    );

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="cc-exp"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={5}
        id={id}
        name={name}
        aria-label={ariaLabel}
        className={className}
        style={{
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
          fontSize: '16px',
          fontFamily: 'monospace',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '80px',
          textAlign: 'center',
          ...style,
        }}
      />
    );
  }
);

/**
 * CVV input component
 */
export const CvvInput = forwardRef<HTMLInputElement, CvvInputProps>(
  function CvvInput(props, ref) {
    const {
      value = '',
      onChange,
      onBlur,
      cardType = 'unknown',
      placeholder = 'CVV',
      disabled = false,
      masked = true,
      className,
      style,
      id,
      name,
      'aria-label': ariaLabel = 'CVV',
    } = props;

    const info = getCardInfo(cardType);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replace(/\D/g, '');
        if (cleaned.length <= info.cvvLength) {
          onChange?.(cleaned);
        }
      },
      [onChange, info.cvvLength]
    );

    return (
      <input
        ref={ref}
        type={masked ? 'password' : 'text'}
        inputMode="numeric"
        autoComplete="cc-csc"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={info.cvvLength}
        id={id}
        name={name}
        aria-label={ariaLabel}
        className={className}
        style={{
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
          fontSize: '16px',
          fontFamily: 'monospace',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '70px',
          textAlign: 'center',
          ...style,
        }}
      />
    );
  }
);

/**
 * Get card brand SVG icon based on card type
 */
function getCardIcon(cardType: CardType): React.ReactElement {
  const svgProps = {
    width: '28' as const,
    height: '18' as const,
    viewBox: '0 0 28 18',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    role: 'img' as const,
  };

  switch (cardType) {
    case 'visa':
      return (
        <svg {...svgProps} aria-label="Visa">
          <rect width="28" height="18" rx="3" fill="#1A1F71" />
          <text x="14" y="13" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="Arial, sans-serif" fontWeight="bold" fontStyle="italic" letterSpacing="0.5">VISA</text>
        </svg>
      );
    case 'mastercard':
      return (
        <svg {...svgProps} aria-label="Mastercard">
          <rect width="28" height="18" rx="3" fill="#252525" />
          <circle cx="11" cy="9" r="5.5" fill="#EB001B" />
          <circle cx="17" cy="9" r="5.5" fill="#F79E1B" />
          <path d="M14 4.6A5.5 5.5 0 0 1 16.9 9 5.5 5.5 0 0 1 14 13.4 5.5 5.5 0 0 1 11.1 9 5.5 5.5 0 0 1 14 4.6Z" fill="#FF5F00" />
        </svg>
      );
    case 'amex':
      return (
        <svg {...svgProps} aria-label="American Express">
          <rect width="28" height="18" rx="3" fill="#007BC1" />
          <text x="14" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="0.5">AMEX</text>
        </svg>
      );
    case 'discover':
      return (
        <svg {...svgProps} aria-label="Discover">
          <rect width="28" height="18" rx="3" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
          <circle cx="21" cy="9" r="5" fill="#F76F20" />
          <text x="5" y="12" fill="#231F20" fontSize="5.5" fontFamily="Arial, sans-serif" fontWeight="bold">DISC</text>
        </svg>
      );
    case 'diners':
      return (
        <svg {...svgProps} aria-label="Diners Club">
          <rect width="28" height="18" rx="3" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
          <circle cx="12" cy="9" r="5.5" fill="none" stroke="#004A97" strokeWidth="1" />
          <circle cx="16" cy="9" r="5.5" fill="none" stroke="#004A97" strokeWidth="1" />
        </svg>
      );
    case 'jcb':
      return (
        <svg {...svgProps} aria-label="JCB">
          <rect width="28" height="18" rx="3" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
          <rect x="5" y="3" width="6" height="12" rx="2" fill="#003087" />
          <rect x="11" y="3" width="6" height="12" rx="2" fill="#CC0000" />
          <rect x="17" y="3" width="6" height="12" rx="2" fill="#009A44" />
        </svg>
      );
    case 'unionpay':
      return (
        <svg {...svgProps} aria-label="UnionPay">
          <rect width="28" height="18" rx="3" fill="#CC0000" />
          <rect x="14" y="0" width="14" height="18" rx="3" fill="#003087" />
          <text x="14" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontFamily="Arial, sans-serif" fontWeight="bold">UP</text>
        </svg>
      );
    case 'maestro':
      return (
        <svg {...svgProps} aria-label="Maestro">
          <rect width="28" height="18" rx="3" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
          <circle cx="11" cy="9" r="5.5" fill="#CC0000" />
          <circle cx="17" cy="9" r="5.5" fill="#0099DF" opacity="0.85" />
          <path d="M14 4.6A5.5 5.5 0 0 1 16.9 9 5.5 5.5 0 0 1 14 13.4 5.5 5.5 0 0 1 11.1 9 5.5 5.5 0 0 1 14 4.6Z" fill="#7B0099" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...svgProps} aria-label="Credit card">
          <rect width="28" height="18" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="0.5" />
          <rect x="3" y="6" width="8" height="4" rx="1" fill="#9CA3AF" />
          <rect x="3" y="12" width="5" height="1.5" rx="0.5" fill="#D1D5DB" />
          <rect x="9" y="12" width="5" height="1.5" rx="0.5" fill="#D1D5DB" />
          <rect x="15" y="12" width="5" height="1.5" rx="0.5" fill="#D1D5DB" />
        </svg>
      );
  }
}

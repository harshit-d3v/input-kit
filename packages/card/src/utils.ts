// @input-kit/card - Utilities

import { CardType, CardInfo } from './types';

export const CARD_PATTERNS: Record<CardType, CardInfo> = {
  visa: {
    type: 'visa',
    name: 'Visa',
    pattern: /^4/,
    lengths: [16, 18, 19],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
  mastercard: {
    type: 'mastercard',
    name: 'Mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    lengths: [16],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
  amex: {
    type: 'amex',
    name: 'American Express',
    pattern: /^3[47]/,
    lengths: [15],
    cvvLength: 4,
    gaps: [4, 10],
  },
  discover: {
    type: 'discover',
    name: 'Discover',
    pattern: /^(6011|65|64[4-9]|622)/,
    lengths: [16, 19],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
  diners: {
    type: 'diners',
    name: 'Diners Club',
    pattern: /^(36|38|30[0-5])/,
    lengths: [14, 16, 19],
    cvvLength: 3,
    gaps: [4, 10],
  },
  jcb: {
    type: 'jcb',
    name: 'JCB',
    pattern: /^35/,
    lengths: [16, 17, 18, 19],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
  unionpay: {
    type: 'unionpay',
    name: 'UnionPay',
    pattern: /^62/,
    lengths: [16, 17, 18, 19],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
  maestro: {
    type: 'maestro',
    name: 'Maestro',
    pattern: /^(50|5[6-9]|63[^7]|67)/,
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
  unknown: {
    type: 'unknown',
    name: 'Unknown',
    pattern: /^/,
    lengths: [16],
    cvvLength: 3,
    gaps: [4, 8, 12],
  },
};

/**
 * Detect card type from card number
 */
export function detectCardType(cardNumber: string): CardType {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check patterns in order of specificity
  const cardTypes: CardType[] = ['amex', 'visa', 'mastercard', 'discover', 'diners', 'jcb', 'unionpay', 'maestro'];
  
  for (const type of cardTypes) {
    if (CARD_PATTERNS[type].pattern.test(cleaned)) {
      return type;
    }
  }
  
  return 'unknown';
}

/**
 * Get card info by type
 */
export function getCardInfo(type: CardType): CardInfo {
  return CARD_PATTERNS[type] || CARD_PATTERNS.unknown;
}

/**
 * Luhn algorithm validation
 */
export function luhnCheck(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length === 0) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(cardNumber: string, cardType: CardType = 'unknown'): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  const info = getCardInfo(cardType);
  const gaps = info.gaps;
  
  let formatted = '';
  let gapIndex = 0;
  
  for (let i = 0; i < cleaned.length; i++) {
    if (gapIndex < gaps.length && i === gaps[gapIndex]) {
      formatted += ' ';
      gapIndex++;
    }
    formatted += cleaned[i];
  }
  
  return formatted;
}

/**
 * Get max length for card number (including spaces)
 */
export function getMaxCardLength(cardType: CardType): number {
  const info = getCardInfo(cardType);
  const maxDigits = Math.max(...info.lengths);
  const spaces = info.gaps.length;
  return maxDigits + spaces;
}

/**
 * Validate card number
 */
export function validateCardNumber(cardNumber: string): { isValid: boolean; error?: string } {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { isValid: false, error: 'Card number is required' };
  }
  
  const cardType = detectCardType(cleaned);
  const info = getCardInfo(cardType);
  
  if (!info.lengths.includes(cleaned.length)) {
    return { isValid: false, error: `Invalid card number length` };
  }
  
  if (!luhnCheck(cleaned)) {
    return { isValid: false, error: 'Invalid card number' };
  }
  
  return { isValid: true };
}

/**
 * Format expiry date (MM/YY)
 */
export function formatExpiryDate(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) {
    // Auto-prefix with 0 if first digit is > 1
    if (parseInt(cleaned, 10) > 1) {
      return `0${cleaned}/`;
    }
    return cleaned;
  }
  if (cleaned.length === 2) {
    return `${cleaned}/`;
  }
  
  const month = cleaned.slice(0, 2);
  const year = cleaned.slice(2, 4);
  
  return `${month}/${year}`;
}

/**
 * Validate expiry date
 */
export function validateExpiryDate(expiryDate: string): { isValid: boolean; error?: string } {
  const cleaned = expiryDate.replace(/\D/g, '');
  
  if (cleaned.length < 4) {
    return { isValid: false, error: 'Expiry date is incomplete' };
  }
  
  const month = parseInt(cleaned.slice(0, 2), 10);
  const year = parseInt(cleaned.slice(2, 4), 10);
  
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month' };
  }
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }
  
  // Don't allow expiry more than 20 years in the future
  if (year > currentYear + 20) {
    return { isValid: false, error: 'Invalid expiry date' };
  }
  
  return { isValid: true };
}

/**
 * Validate CVV
 */
export function validateCvv(cvv: string, cardType: CardType = 'unknown'): { isValid: boolean; error?: string } {
  const cleaned = cvv.replace(/\D/g, '');
  const info = getCardInfo(cardType);
  
  if (cleaned.length === 0) {
    return { isValid: false, error: 'CVV is required' };
  }
  
  if (cleaned.length !== info.cvvLength) {
    return { isValid: false, error: `CVV must be ${info.cvvLength} digits` };
  }
  
  return { isValid: true };
}

/**
 * Mask card number (show last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length <= 4) return cleaned;
  
  const masked = '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  return formatCardNumber(masked, detectCardType(cleaned));
}

/**
 * Parse expiry date string to month and year
 */
export function parseExpiryDate(expiryDate: string): { month: string; year: string } {
  const cleaned = expiryDate.replace(/\D/g, '');
  return {
    month: cleaned.slice(0, 2),
    year: cleaned.slice(2, 4),
  };
}

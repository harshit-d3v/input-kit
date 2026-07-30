// @input-kit/card - useCardInput hook

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  CardType,
  CardErrors,
  UseCardInputOptions,
  UseCardInputReturn,
} from './types';
import {
  detectCardType,
  formatCardNumber,
  formatExpiryDate,
  validateCardNumber,
  validateExpiryDate,
  validateCvv,
  parseExpiryDate,
  getCardInfo,
} from './utils';

export function useCardInput(options: UseCardInputOptions = {}): UseCardInputReturn {
  const {
    initialCardNumber = '',
    initialExpiryDate = '',
    initialCvv = '',
    initialCardholderName = '',
    onCardTypeChange,
    onValidationChange,
  } = options;

  const [cardNumber, setCardNumberState] = useState(initialCardNumber.replace(/\D/g, ''));
  const [cardType, setCardType] = useState<CardType>(() => detectCardType(initialCardNumber));
  const [expiryDate, setExpiryDateState] = useState(initialExpiryDate);
  const [cvv, setCvvState] = useState(initialCvv);
  const [cardholderName, setCardholderNameState] = useState(initialCardholderName);
  const [errors, setErrors] = useState<CardErrors>({});

  // Derived state
  const cardNumberFormatted = formatCardNumber(cardNumber, cardType);
  const { month: expiryMonth, year: expiryYear } = parseExpiryDate(expiryDate);

  // Validation state
  const cardNumberValidation = validateCardNumber(cardNumber);
  const expiryValidation = validateExpiryDate(expiryDate);
  const cvvValidation = validateCvv(cvv, cardType);

  const isCardNumberValid = cardNumberValidation.isValid;
  const isExpiryValid = expiryValidation.isValid;
  const isCvvValid = cvvValidation.isValid;
  const isValid = isCardNumberValid && isExpiryValid && isCvvValid;

  // Callbacks go through refs so their identity does not drive the effects. Passed
  // inline — the normal thing to do — they used to change every render, so both
  // notifications fired on every render rather than only when the value changed, and
  // both fired once on mount before the user had entered anything.
  const onCardTypeChangeRef = useRef(onCardTypeChange);
  const onValidationChangeRef = useRef(onValidationChange);
  onCardTypeChangeRef.current = onCardTypeChange;
  onValidationChangeRef.current = onValidationChange;

  const hasNotifiedTypeRef = useRef(false);
  const hasNotifiedValidRef = useRef(false);

  useEffect(() => {
    if (!hasNotifiedTypeRef.current) {
      hasNotifiedTypeRef.current = true;
      return;
    }
    onCardTypeChangeRef.current?.(cardType);
  }, [cardType]);

  useEffect(() => {
    if (!hasNotifiedValidRef.current) {
      hasNotifiedValidRef.current = true;
      return;
    }
    onValidationChangeRef.current?.(isValid);
  }, [isValid]);

  const setCardNumber = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const newType = detectCardType(cleaned);
    const info = getCardInfo(newType);
    const maxLength = Math.max(...info.lengths);
    
    const truncated = cleaned.slice(0, maxLength);
    setCardNumberState(truncated);
    setCardType(newType);
    
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, cardNumber: undefined }));
  }, []);

  const setExpiryDate = useCallback((value: string) => {
    const formatted = formatExpiryDate(value);
    // Max length is 5 (MM/YY)
    if (formatted.length <= 5) {
      setExpiryDateState(formatted);
    }
    setErrors((prev) => ({ ...prev, expiryDate: undefined }));
  }, []);

  const setCvv = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const info = getCardInfo(cardType);
    const truncated = cleaned.slice(0, info.cvvLength);
    setCvvState(truncated);
    setErrors((prev) => ({ ...prev, cvv: undefined }));
  }, [cardType]);

  const setCardholderName = useCallback((value: string) => {
    setCardholderNameState(value);
    setErrors((prev) => ({ ...prev, cardholderName: undefined }));
  }, []);

  const reset = useCallback(() => {
    setCardNumberState('');
    setCardType('unknown');
    setExpiryDateState('');
    setCvvState('');
    setCardholderNameState('');
    setErrors({});
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: CardErrors = {};

    if (!cardNumberValidation.isValid) {
      newErrors.cardNumber = cardNumberValidation.error;
    }

    if (!expiryValidation.isValid) {
      newErrors.expiryDate = expiryValidation.error;
    }

    if (!cvvValidation.isValid) {
      newErrors.cvv = cvvValidation.error;
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumberValidation, expiryValidation, cvvValidation, cardholderName]);

  return {
    cardNumber,
    cardNumberFormatted,
    cardType,
    expiryDate,
    expiryMonth,
    expiryYear,
    cvv,
    cardholderName,
    isValid,
    isCardNumberValid,
    isExpiryValid,
    isCvvValid,
    errors,
    setCardNumber,
    setExpiryDate,
    setCvv,
    setCardholderName,
    reset,
    validate,
  };
}

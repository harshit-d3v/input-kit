// @input-kit/card - Types

export type CardType = 
  | 'visa' 
  | 'mastercard' 
  | 'amex' 
  | 'discover' 
  | 'diners' 
  | 'jcb' 
  | 'unionpay' 
  | 'maestro' 
  | 'unknown';

export interface CardInfo {
  type: CardType;
  name: string;
  pattern: RegExp;
  lengths: number[];
  cvvLength: number;
  gaps: number[];
}

export interface CardState {
  cardNumber: string;
  cardNumberFormatted: string;
  cardType: CardType;
  expiryDate: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  isValid: boolean;
  isCardNumberValid: boolean;
  isExpiryValid: boolean;
  isCvvValid: boolean;
  errors: CardErrors;
}

export interface CardErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface UseCardInputOptions {
  initialCardNumber?: string;
  initialExpiryDate?: string;
  initialCvv?: string;
  initialCardholderName?: string;
  onCardTypeChange?: (type: CardType) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export interface UseCardInputReturn extends CardState {
  setCardNumber: (value: string) => void;
  setExpiryDate: (value: string) => void;
  setCvv: (value: string) => void;
  setCardholderName: (value: string) => void;
  reset: () => void;
  validate: () => boolean;
}

export interface CardInputProps {
  value?: string;
  onChange?: (value: string, cardType: CardType) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  masked?: boolean;
  showIcon?: boolean;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export interface ExpiryInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export interface CvvInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  cardType?: CardType;
  placeholder?: string;
  disabled?: boolean;
  masked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

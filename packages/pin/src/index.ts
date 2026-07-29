// @input-kit/pin
export { PinInput } from './PinInput';
export { OtpInput } from './OtpInput';
export { usePinInput } from './usePinInput';

export type {
  PinInputProps,
  OtpInputProps,
  PinInputBaseProps,
  UsePinInputOptions,
  UsePinInputReturn,
  PinInputFieldProps,
} from './types';

export type { PinInputRef } from './PinInput';
export type { OtpInputRef } from './OtpInput';

// Utility functions
export {
  isNumeric,
  isAlphanumeric,
  validateChar,
  filterValue,
  valueToArray,
  isCompleteValue,
  getNextEmptyIndex,
  getLastFilledIndex,
  selectInputText,
} from './utils';

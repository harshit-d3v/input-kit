// Main exports
export { NumberInput } from './NumberInput';
export { useNumberInput } from './useNumberInput';

// Types
export type {
  NumberInputOptions,
  NumberInputState,
  NumberInputActions,
  NumberInputProps,
  UseNumberInputReturn,
  NumberFormat,
} from './types';

export type { NumberInputRef } from './NumberInput';

// Utilities (exported for advanced use cases)
export {
  getDefaultLocale,
  parseNumber,
  formatNumber,
  clamp,
  roundToDecimals,
  incrementValue,
  decrementValue,
  validateNumber,
} from './utils';

/**
 * Color format types supported by the color picker
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'hsv';

/**
 * RGB color representation
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
  a?: number;
}

/**
 * HSV color representation
 */
export interface HSV {
  h: number;
  s: number;
  v: number;
  a?: number;
}

/**
 * OKLCH color representation (perceptually uniform color space)
 */
export interface OKLCH {
  l: number;
  c: number;
  h: number;
  a?: number;
}

/**
 * HEX color representation (with or without alpha)
 */
export type HEX = string;

/**
 * Union type for all color representations
 */
export type Color = RGB | HSL | HSV | OKLCH | HEX;

/**
 * Color picker state
 */
export interface ColorPickerState {
  /** Current color in the original format */
  color: Color;
  /** Color in HEX format */
  hex: HEX;
  /** Color in RGB format */
  rgb: RGB;
  /** Color in HSL format */
  hsl: HSL;
  /** Color in HSV format */
  hsv: HSV;
  /** Color in OKLCH format */
  oklch: OKLCH;
  /** Current alpha value (0-1) */
  alpha: number;
}

/**
 * Options for the useColorPicker hook
 */
export interface UseColorPickerOptions {
  /** Default color value */
  defaultValue?: string;
  /** Color format */
  format?: ColorFormat;
  /** Enable alpha channel */
  showAlpha?: boolean;
  /** Callback when color changes */
  onChange?: (color: ColorPickerState) => void;
}

/**
 * Return type for the useColorPicker hook
 */
export interface UseColorPickerReturn extends ColorPickerState {
  /** Set color from any supported format */
  setColor: (color: string | RGB | HSL | HSV | OKLCH) => void;
  /** Set color format */
  setFormat: (format: ColorFormat) => void;
  /** Set alpha value (0-1) */
  setAlpha: (alpha: number) => void;
  /** Current format */
  format: ColorFormat;
  /** Whether alpha is enabled */
  showAlpha: boolean;
}

/**
 * Color preset definition
 */
export interface ColorPreset {
  /** Preset name */
  name: string;
  /** Preset color value */
  value: string;
}

/**
 * Props for the ColorInput component
 */
export interface ColorInputProps {
  /** Current color value */
  value?: string;
  /** Callback when color changes */
  onChange?: (value: string) => void;
  /** Color format */
  format?: ColorFormat;
  /** Show alpha channel */
  showAlpha?: boolean;
  /** Color presets */
  presets?: ColorPreset[];
  /** Disabled state */
  disabled?: boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** Accessible labelledby */
  'aria-labelledby'?: string;
  /** ID for the input */
  id?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Parsed color result with all formats
 */
export interface ParsedColor {
  hex: HEX;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  oklch: OKLCH;
  alpha: number;
  valid: boolean;
}

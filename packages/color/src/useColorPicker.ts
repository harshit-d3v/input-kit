import { useState, useCallback, useMemo } from 'react';
import type {
  ColorFormat,
  ColorPickerState,
  UseColorPickerOptions,
  UseColorPickerReturn,
  RGB,
  HSL,
  HSV,
  OKLCH,
} from './types';
import { parseColor, formatColor, rgbToHsl, rgbToHsv, rgbToOklch, rgbToHex, hslToRgb, hsvToRgb, oklchToRgb } from './utils';

const DEFAULT_COLOR = '#007acc';

/**
 * React hook for managing color picker state
 * 
 * @example
 * ```tsx
 * const { color, setColor, hex, rgb, hsl } = useColorPicker({
 *   defaultValue: '#007acc',
 *   format: 'hex'
 * });
 * ```
 */
export function useColorPicker(options: UseColorPickerOptions = {}): UseColorPickerReturn {
  const {
    defaultValue = DEFAULT_COLOR,
    format: initialFormat = 'hex',
    showAlpha: initialShowAlpha = false,
    onChange,
  } = options;

  const [format, setFormatState] = useState<ColorFormat>(initialFormat);
  const [showAlpha] = useState(initialShowAlpha);

  // Parse the initial/default color
  const initialParsed = useMemo(() => {
    const parsed = parseColor(defaultValue);
    return parsed || parseColor(DEFAULT_COLOR)!;
  }, [defaultValue]);

  const [state, setState] = useState<ColorPickerState>({
    color: formatColor(initialParsed.rgb, initialFormat, { showAlpha: initialShowAlpha }),
    hex: initialParsed.hex,
    rgb: initialParsed.rgb,
    hsl: initialParsed.hsl,
    hsv: initialParsed.hsv,
    oklch: initialParsed.oklch,
    alpha: initialParsed.alpha,
  });

  /**
   * Update all color formats based on RGB values
   */
  const updateColorFromRgb = useCallback((rgb: RGB, triggerOnChange = true) => {
    const alpha = rgb.a ?? 1;
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    const oklch = rgbToOklch(rgb);
    const hex = rgbToHex(rgb);

    const newState: ColorPickerState = {
      color: formatColor(rgb, format, { showAlpha }),
      hex,
      rgb: { ...rgb, a: alpha },
      hsl: { ...hsl, a: alpha },
      hsv: { ...hsv, a: alpha },
      oklch: { ...oklch, a: alpha },
      alpha,
    };

    setState(newState);

    if (triggerOnChange && onChange) {
      onChange(newState);
    }
  }, [format, showAlpha, onChange]);

  /**
   * Set color from various formats
   */
  const setColor = useCallback((color: string | RGB | HSL | HSV | OKLCH) => {
    let rgb: RGB | null = null;

    if (typeof color === 'string') {
      const parsed = parseColor(color);
      if (parsed) {
        rgb = parsed.rgb;
      }
    } else if ('r' in color && 'g' in color && 'b' in color) {
      rgb = color as RGB;
    } else if ('h' in color && 's' in color && 'l' in color) {
      rgb = hslToRgb(color as HSL);
    } else if ('h' in color && 's' in color && 'v' in color) {
      rgb = hsvToRgb(color as HSV);
    } else if ('l' in color && 'c' in color) {
      rgb = oklchToRgb(color as OKLCH);
    }

    if (rgb) {
      updateColorFromRgb(rgb);
    }
  }, [updateColorFromRgb]);

  /**
   * Set the color format
   */
  const setFormat = useCallback((newFormat: ColorFormat) => {
    setFormatState(newFormat);
    setState(prev => ({
      ...prev,
      color: formatColor(prev.rgb, newFormat, { showAlpha }),
    }));
  }, [showAlpha]);

  /**
   * Set the alpha value
   */
  const setAlpha = useCallback((alpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    const rgb: RGB = { ...state.rgb, a: clampedAlpha };
    updateColorFromRgb(rgb);
  }, [state.rgb, updateColorFromRgb]);

  return {
    ...state,
    setColor,
    setFormat,
    setAlpha,
    format,
    showAlpha,
  };
}

export default useColorPicker;

import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToOklch,
  oklchToRgb,
  parseColor,
  formatColor,
  isValidColor,
  getContrastRatio,
  getContrastText,
} from './utils';
import type { RGB, HSL, HSV, OKLCH } from './types';

describe('hexToRgb', () => {
  it('converts 3-digit hex to RGB', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('converts 6-digit hex to RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hexToRgb('#007acc')).toEqual({ r: 0, g: 122, b: 204, a: 1 });
  });

  it('converts hex with alpha', () => {
    const result1 = hexToRgb('#ffffff80');
    expect(result1?.r).toBe(255);
    expect(result1?.g).toBe(255);
    expect(result1?.b).toBe(255);
    expect(result1?.a).toBeCloseTo(0.5, 1);
    
    const result2 = hexToRgb('#fff8');
    expect(result2?.r).toBe(255);
    expect(result2?.g).toBe(255);
    expect(result2?.b).toBe(255);
    expect(result2?.a).toBeCloseTo(0.53, 1);
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#gggggg')).toBeNull();
    expect(hexToRgb('#ff')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
    expect(rgbToHex({ r: 0, g: 122, b: 204 })).toBe('#007acc');
  });

  it('converts RGB with alpha to hex', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255, a: 0.5 })).toBe('#ffffff80');
    expect(rgbToHex({ r: 0, g: 0, b: 0, a: 0 })).toBe('#00000000');
  });

  it('clamps values to valid range', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
  });
});

describe('rgbToHsl', () => {
  it('converts RGB to HSL', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100, a: undefined });
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0, a: undefined });
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50, a: undefined });
  });

  it('preserves alpha', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0, a: 0.5 })).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
  });
});

describe('hslToRgb', () => {
  it('converts HSL to RGB', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255, a: undefined });
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0, a: undefined });
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0, a: undefined });
  });

  it('preserves alpha', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50, a: 0.5 })).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it('round-trip conversion', () => {
    const original: RGB = { r: 128, g: 64, b: 200 };
    const hsl = rgbToHsl(original);
    const result = hslToRgb(hsl);
    expect(result.r).toBeCloseTo(original.r, -1);
    expect(result.g).toBeCloseTo(original.g, -1);
    expect(result.b).toBeCloseTo(original.b, -1);
  });
});

describe('rgbToHsv', () => {
  it('converts RGB to HSV', () => {
    expect(rgbToHsv({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, v: 100, a: undefined });
    expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0, a: undefined });
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, v: 100, a: undefined });
  });

  it('preserves alpha', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0, a: 0.5 })).toEqual({ h: 0, s: 100, v: 100, a: 0.5 });
  });
});

describe('hsvToRgb', () => {
  it('converts HSV to RGB', () => {
    expect(hsvToRgb({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255, a: undefined });
    expect(hsvToRgb({ h: 0, s: 0, v: 0 })).toEqual({ r: 0, g: 0, b: 0, a: undefined });
    expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0, a: undefined });
  });

  it('preserves alpha', () => {
    expect(hsvToRgb({ h: 0, s: 100, v: 100, a: 0.5 })).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it('round-trip conversion', () => {
    const original: RGB = { r: 128, g: 64, b: 200 };
    const hsv = rgbToHsv(original);
    const result = hsvToRgb(hsv);
    expect(result.r).toBeCloseTo(original.r, -1);
    expect(result.g).toBeCloseTo(original.g, -1);
    expect(result.b).toBeCloseTo(original.b, -1);
  });
});

describe('rgbToOklch', () => {
  it('converts RGB to OKLCH', () => {
    const result = rgbToOklch({ r: 255, g: 255, b: 255 });
    expect(result.l).toBeCloseTo(1, 1);
    expect(result.c).toBeCloseTo(0, 1);
    
    const black = rgbToOklch({ r: 0, g: 0, b: 0 });
    expect(black.l).toBeCloseTo(0, 1);
  });

  it('preserves alpha', () => {
    const result = rgbToOklch({ r: 255, g: 0, b: 0, a: 0.5 });
    expect(result.a).toBe(0.5);
  });
});

describe('oklchToRgb', () => {
  it('converts OKLCH to RGB', () => {
    const white: OKLCH = { l: 1, c: 0, h: 0 };
    const result = oklchToRgb(white);
    expect(result.r).toBe(255);
    expect(result.g).toBe(255);
    expect(result.b).toBe(255);
  });

  it('preserves alpha', () => {
    const red: OKLCH = { l: 0.6, c: 0.3, h: 30, a: 0.5 };
    const result = oklchToRgb(red);
    expect(result.a).toBe(0.5);
  });
});

describe('parseColor', () => {
  it('parses hex colors', () => {
    const result = parseColor('#ff0000');
    expect(result).not.toBeNull();
    expect(result?.hex).toBe('#ff0000');
    expect(result?.rgb).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses rgb colors', () => {
    const result = parseColor('rgb(255, 128, 0)');
    expect(result).not.toBeNull();
    expect(result?.rgb.r).toBe(255);
    expect(result?.rgb.g).toBe(128);
    expect(result?.rgb.b).toBe(0);
  });

  it('parses rgba colors', () => {
    const result = parseColor('rgba(255, 0, 0, 0.5)');
    expect(result).not.toBeNull();
    expect(result?.alpha).toBe(0.5);
  });

  it('parses hsl colors', () => {
    const result = parseColor('hsl(120, 100%, 50%)');
    expect(result).not.toBeNull();
    expect(result?.hsl.h).toBe(120);
    expect(result?.hsl.s).toBe(100);
    expect(result?.hsl.l).toBe(50);
  });

  it('parses named colors', () => {
    expect(parseColor('red')?.hex).toBe('#ff0000');
    expect(parseColor('white')?.hex).toBe('#ffffff');
    expect(parseColor('black')?.hex).toBe('#000000');
    expect(parseColor('blue')?.hex).toBe('#0000ff');
  });

  it('returns null for invalid colors', () => {
    expect(parseColor('invalid')).toBeNull();
    expect(parseColor('')).toBeNull();
    expect(parseColor('#gggggg')).toBeNull();
  });
});

describe('formatColor', () => {
  it('formats to hex', () => {
    expect(formatColor({ r: 255, g: 0, b: 0 }, 'hex')).toBe('#ff0000');
  });

  it('formats to rgb', () => {
    expect(formatColor({ r: 255, g: 128, b: 0 }, 'rgb')).toBe('rgb(255, 128, 0)');
  });

  it('formats to rgba with alpha', () => {
    expect(formatColor({ r: 255, g: 0, b: 0, a: 0.5 }, 'rgb', { showAlpha: true }))
      .toBe('rgba(255, 0, 0, 0.50)');
  });

  it('formats to hsl', () => {
    expect(formatColor({ r: 255, g: 0, b: 0 }, 'hsl')).toBe('hsl(0, 100%, 50%)');
  });

  it('formats to hsv', () => {
    expect(formatColor({ r: 255, g: 0, b: 0 }, 'hsv')).toBe('hsv(0, 100%, 100%)');
  });

  it('formats to oklch', () => {
    const result = formatColor({ r: 255, g: 0, b: 0 }, 'oklch');
    expect(result.startsWith('oklch(')).toBe(true);
  });
});

describe('isValidColor', () => {
  it('returns true for valid colors', () => {
    expect(isValidColor('#ff0000')).toBe(true);
    expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
    expect(isValidColor('hsl(0, 100%, 50%)')).toBe(true);
    expect(isValidColor('red')).toBe(true);
  });

  it('returns false for invalid colors', () => {
    expect(isValidColor('invalid')).toBe(false);
    expect(isValidColor('#gggggg')).toBe(false);
    expect(isValidColor('')).toBe(false);
  });
});

describe('getContrastRatio', () => {
  it('calculates contrast ratio between colors', () => {
    const ratio = getContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeGreaterThan(20);
  });

  it('returns lower ratio for similar colors', () => {
    const ratio = getContrastRatio('#ffffff', '#eeeeee');
    expect(ratio).toBeLessThan(2);
  });

  it('returns 0 for invalid colors', () => {
    expect(getContrastRatio('invalid', '#000000')).toBe(0);
  });
});

describe('getContrastText', () => {
  it('returns white text for dark backgrounds', () => {
    expect(getContrastText('#000000')).toBe('#ffffff');
    expect(getContrastText('#333333')).toBe('#ffffff');
  });

  it('returns black text for light backgrounds', () => {
    expect(getContrastText('#ffffff')).toBe('#000000');
    expect(getContrastText('#cccccc')).toBe('#000000');
  });
});

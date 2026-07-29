import type { RGB, HSL, HSV, OKLCH, HEX, ColorFormat, ParsedColor } from './types';

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: HEX): RGB | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Validate hex format — only allow exactly 3, 4, 6 or 8 hex chars
  const hexRegex = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (!hexRegex.test(cleanHex)) {
    return null;
  }

  let r: number, g: number, b: number, a = 1;

  if (cleanHex.length === 3) {
    // Short form: #RGB
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 4) {
    // Short form with alpha: #RGBA
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
    a = parseInt(cleanHex[3] + cleanHex[3], 16) / 255;
  } else if (cleanHex.length === 6) {
    // Long form: #RRGGBB
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 8) {
    // Long form with alpha: #RRGGBBAA
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
    a = parseInt(cleanHex.substring(6, 8), 16) / 255;
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    return null;
  }

  return { r, g, b, a: clamp(a, 0, 1) };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): HEX {
  const toHex = (n: number): string => {
    const hex = clamp(Math.round(n), 0, 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  
  if (rgb.a !== undefined && rgb.a < 1) {
    const alphaHex = Math.round(clamp(rgb.a, 0, 1) * 255).toString(16).padStart(2, '0');
    return hex + alphaHex;
  }
  
  return hex;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a,
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a,
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: rgb.a,
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  let r = 0, g = 0, b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsv.a,
  };
}

/**
 * Convert RGB to OKLCH
 * Uses CSS Color Module Level 4 algorithm
 */
export function rgbToOklch(rgb: RGB): OKLCH {
  // First convert sRGB to linear RGB
  const toLinear = (c: number): number => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  // Convert linear RGB to XYZ (D65)
  const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
  const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

  // Convert XYZ to OKLab
  const lms = [
    0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z,
    0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z,
    0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z,
  ];

  const lmsCbrt = lms.map(v => Math.cbrt(Math.max(0, v)));

  const lab = {
    l: 0.2104542553 * lmsCbrt[0] + 0.7936177850 * lmsCbrt[1] - 0.0040720468 * lmsCbrt[2],
    a: 1.9779984951 * lmsCbrt[0] - 2.4285922050 * lmsCbrt[1] + 0.4505937099 * lmsCbrt[2],
    b: 0.0259040371 * lmsCbrt[0] + 0.7827717662 * lmsCbrt[1] - 0.8086757660 * lmsCbrt[2],
  };

  // Convert OKLab to OKLCH
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return {
    l: Math.round(lab.l * 1000) / 1000,
    c: Math.round(c * 1000) / 1000,
    h: Math.round(h),
    a: rgb.a,
  };
}

/**
 * Convert OKLCH to RGB
 * Uses CSS Color Module Level 4 algorithm
 */
export function oklchToRgb(oklch: OKLCH): RGB {
  const l = oklch.l;
  const c = oklch.c;
  const h = oklch.h * (Math.PI / 180);

  // Convert OKLCH to OKLab
  const lab = {
    l,
    a: c * Math.cos(h),
    b: c * Math.sin(h),
  };

  // Convert OKLab to LMS
  const lmsCbrt = [
    lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b,
    lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b,
    lab.l - 0.0894841775 * lab.a - 1.2914855480 * lab.b,
  ];

  const lms = lmsCbrt.map(v => v * v * v);

  // Convert LMS to XYZ (D65)
  const xyz = {
    x: 1.2270138511035211 * lms[0] - 0.5577992887910691 * lms[1] + 0.2812561489664677 * lms[2],
    y: -0.0405801784237345 * lms[0] + 1.1122568696168821 * lms[1] - 0.0716766786656241 * lms[2],
    z: -0.0763812845057069 * lms[0] - 0.4214819784180127 * lms[1] + 1.5861632204405947 * lms[2],
  };

  // Convert XYZ to linear RGB
  const linearR = 3.2404541621141035 * xyz.x - 1.5371385127977156 * xyz.y - 0.4985314095560119 * xyz.z;
  const linearG = -0.9692660305051868 * xyz.x + 1.8760108454466942 * xyz.y + 0.04155601753034984 * xyz.z;
  const linearB = 0.05564343095911469 * xyz.x - 0.2040259135167538 * xyz.y + 1.0572251882231791 * xyz.z;

  // Convert linear RGB to sRGB
  const toSrgb = (c: number): number => {
    c = clamp(c, 0, 1);
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  return {
    r: Math.round(toSrgb(linearR) * 255),
    g: Math.round(toSrgb(linearG) * 255),
    b: Math.round(toSrgb(linearB) * 255),
    a: oklch.a,
  };
}

/**
 * Parse a color string in various formats
 */
export function parseColor(color: string): ParsedColor | null {
  color = color.trim();

  let rgb: RGB | null = null;

  // Try HEX
  if (color.startsWith('#')) {
    rgb = hexToRgb(color);
  }
  // Try RGB/RGBA
  else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (match) {
      rgb = {
        r: clamp(Math.round(parseFloat(match[1])), 0, 255),
        g: clamp(Math.round(parseFloat(match[2])), 0, 255),
        b: clamp(Math.round(parseFloat(match[3])), 0, 255),
        a: match[4] ? clamp(parseFloat(match[4]), 0, 1) : 1,
      };
    }
  }
  // Try HSL/HSLA
  else if (color.startsWith('hsl')) {
    const match = color.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (match) {
      const hsl: HSL = {
        h: clamp(parseFloat(match[1]), 0, 360),
        s: clamp(parseFloat(match[2]), 0, 100),
        l: clamp(parseFloat(match[3]), 0, 100),
        a: match[4] ? clamp(parseFloat(match[4]), 0, 1) : 1,
      };
      rgb = hslToRgb(hsl);
    }
  }
  // Try CSS named colors (basic set)
  else {
    const namedColors: Record<string, string> = {
      transparent: '#00000000',
      black: '#000000',
      white: '#ffffff',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      silver: '#c0c0c0',
      gray: '#808080',
      grey: '#808080',
      maroon: '#800000',
      olive: '#808000',
      lime: '#00ff00',
      aqua: '#00ffff',
      teal: '#008080',
      navy: '#000080',
      fuchsia: '#ff00ff',
      purple: '#800080',
      orange: '#ffa500',
    };
    const hex = namedColors[color.toLowerCase()];
    if (hex) {
      rgb = hexToRgb(hex);
    }
  }

  if (!rgb) {
    return null;
  }

  const alpha = rgb.a ?? 1;
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const oklch = rgbToOklch(rgb);
  const hex = rgbToHex(rgb);

  return {
    hex,
    rgb: { ...rgb, a: alpha },
    hsl: { ...hsl, a: alpha },
    hsv: { ...hsv, a: alpha },
    oklch: { ...oklch, a: alpha },
    alpha,
    valid: true,
  };
}

/**
 * Format a color to a specific format string
 */
export function formatColor(
  color: RGB | HSL | HSV | OKLCH | HEX,
  format: ColorFormat,
  options: { showAlpha?: boolean } = {}
): string {
  const { showAlpha = false } = options;

  // If already a string (HEX), return it
  if (typeof color === 'string') {
    if (format === 'hex') return color;
    const parsed = parseColor(color);
    if (!parsed) return color;
    color = parsed.rgb;
  }

  let rgb: RGB;

  // Convert to RGB first based on input type
  if ('r' in color && 'g' in color && 'b' in color) {
    rgb = color as RGB;
  } else if ('h' in color && 's' in color && 'l' in color) {
    rgb = hslToRgb(color as HSL);
  } else if ('h' in color && 's' in color && 'v' in color) {
    rgb = hsvToRgb(color as HSV);
  } else if ('l' in color && 'c' in color) {
    rgb = oklchToRgb(color as OKLCH);
  } else {
    return String(color);
  }

  const alpha = rgb.a ?? 1;

  switch (format) {
    case 'hex':
      if (showAlpha && alpha < 1) {
        return rgbToHex({ ...rgb, a: alpha });
      }
      return rgbToHex({ r: rgb.r, g: rgb.g, b: rgb.b });

    case 'rgb':
      if (showAlpha || alpha < 1) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
      }
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    case 'hsl': {
      const hsl = rgbToHsl(rgb);
      if (showAlpha || alpha < 1) {
        return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha.toFixed(2)})`;
      }
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    case 'hsv': {
      const hsv = rgbToHsv(rgb);
      if (showAlpha || alpha < 1) {
        return `hsva(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${alpha.toFixed(2)})`;
      }
      return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    }

    case 'oklch': {
      const oklch = rgbToOklch(rgb);
      if (showAlpha || alpha < 1) {
        return `oklch(${oklch.l} ${oklch.c} ${oklch.h} / ${alpha.toFixed(2)})`;
      }
      return `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
    }

    default:
      return rgbToHex(rgb);
  }
}

/**
 * Check if a color string is valid
 */
export function isValidColor(color: string): boolean {
  return parseColor(color) !== null;
}

/**
 * Get contrast ratio between two colors (for accessibility)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const parsed1 = parseColor(color1);
  const parsed2 = parseColor(color2);

  if (!parsed1 || !parsed2) {
    return 0;
  }

  const getLuminance = (rgb: RGB): number => {
    const toLinear = (c: number): number => {
      c = c / 255;
      // IEC 61966-2-1 threshold (0.04045), not the older WCAG draft value (0.03928)
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(parsed1.rgb);
  const lum2 = getLuminance(parsed2.rgb);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if text should be light or dark based on background color
 */
export function getContrastText(backgroundColor: string): '#000000' | '#ffffff' {
  const parsed = parseColor(backgroundColor);
  if (!parsed) return '#000000';

  const lum = (0.299 * parsed.rgb.r + 0.587 * parsed.rgb.g + 0.114 * parsed.rgb.b) / 255;
  return lum > 0.5 ? '#000000' : '#ffffff';
}

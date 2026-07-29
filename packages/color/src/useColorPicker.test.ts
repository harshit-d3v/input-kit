import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColorPicker } from './useColorPicker';

describe('useColorPicker', () => {
  it('initializes with default color', () => {
    const { result } = renderHook(() => useColorPicker());
    
    expect(result.current.hex).toBeDefined();
    expect(result.current.rgb).toBeDefined();
    expect(result.current.hsl).toBeDefined();
    expect(result.current.hsv).toBeDefined();
    expect(result.current.oklch).toBeDefined();
  });

  it('initializes with custom default value', () => {
    const { result } = renderHook(() => 
      useColorPicker({ defaultValue: '#ff0000' })
    );
    
    expect(result.current.hex).toBe('#ff0000');
    expect(result.current.rgb.r).toBe(255);
    expect(result.current.rgb.g).toBe(0);
    expect(result.current.rgb.b).toBe(0);
  });

  it('sets color from hex string', () => {
    const { result } = renderHook(() => useColorPicker());
    
    act(() => {
      result.current.setColor('#00ff00');
    });
    
    expect(result.current.hex).toBe('#00ff00');
    expect(result.current.rgb.r).toBe(0);
    expect(result.current.rgb.g).toBe(255);
    expect(result.current.rgb.b).toBe(0);
  });

  it('sets color from RGB object', () => {
    const { result } = renderHook(() => useColorPicker());
    
    act(() => {
      result.current.setColor({ r: 0, g: 0, b: 255 });
    });
    
    expect(result.current.rgb.b).toBe(255);
    expect(result.current.hex).toBe('#0000ff');
  });

  it('sets color from HSL object', () => {
    const { result } = renderHook(() => useColorPicker());
    
    act(() => {
      result.current.setColor({ h: 120, s: 100, l: 50 });
    });
    
    expect(result.current.hsl.h).toBe(120);
    expect(result.current.hsl.s).toBe(100);
    expect(result.current.hsl.l).toBe(50);
  });

  it('sets color from HSV object', () => {
    const { result } = renderHook(() => useColorPicker());
    
    act(() => {
      result.current.setColor({ h: 240, s: 100, v: 100 });
    });
    
    expect(result.current.hsv.h).toBe(240);
    expect(result.current.hsv.s).toBe(100);
    expect(result.current.hsv.v).toBe(100);
  });

  it('sets color from OKLCH object', () => {
    const { result } = renderHook(() => useColorPicker());
    
    act(() => {
      result.current.setColor({ l: 0.5, c: 0.2, h: 180 });
    });
    
    expect(result.current.oklch.l).toBeCloseTo(0.5, 1);
  });

  it('changes format', () => {
    const { result } = renderHook(() => 
      useColorPicker({ defaultValue: '#ff0000', format: 'hex' })
    );
    
    act(() => {
      result.current.setFormat('rgb');
    });
    
    expect(result.current.format).toBe('rgb');
  });

  it('sets alpha value', () => {
    const { result } = renderHook(() => 
      useColorPicker({ defaultValue: '#ff0000', showAlpha: true })
    );
    
    act(() => {
      result.current.setAlpha(0.5);
    });
    
    expect(result.current.alpha).toBe(0.5);
    expect(result.current.rgb.a).toBe(0.5);
  });

  it('clamps alpha value between 0 and 1', () => {
    const { result } = renderHook(() => useColorPicker());
    
    act(() => {
      result.current.setAlpha(1.5);
    });
    
    expect(result.current.alpha).toBe(1);
    
    act(() => {
      result.current.setAlpha(-0.5);
    });
    
    expect(result.current.alpha).toBe(0);
  });

  it('calls onChange when color changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => 
      useColorPicker({ onChange })
    );
    
    act(() => {
      result.current.setColor('#00ff00');
    });
    
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].hex).toBe('#00ff00');
  });

  it('provides all color formats', () => {
    const { result } = renderHook(() => 
      useColorPicker({ defaultValue: '#007acc' })
    );
    
    // HEX
    expect(result.current.hex).toMatch(/^#[0-9a-f]{6}$/i);
    
    // RGB
    expect(result.current.rgb).toHaveProperty('r');
    expect(result.current.rgb).toHaveProperty('g');
    expect(result.current.rgb).toHaveProperty('b');
    
    // HSL
    expect(result.current.hsl).toHaveProperty('h');
    expect(result.current.hsl).toHaveProperty('s');
    expect(result.current.hsl).toHaveProperty('l');
    
    // HSV
    expect(result.current.hsv).toHaveProperty('h');
    expect(result.current.hsv).toHaveProperty('s');
    expect(result.current.hsv).toHaveProperty('v');
    
    // OKLCH
    expect(result.current.oklch).toHaveProperty('l');
    expect(result.current.oklch).toHaveProperty('c');
    expect(result.current.oklch).toHaveProperty('h');
  });

  it('maintains alpha when set directly', () => {
    const { result } = renderHook(() => 
      useColorPicker({ defaultValue: '#ff0000', showAlpha: true })
    );
    
    act(() => {
      result.current.setAlpha(0.5);
    });
    
    expect(result.current.alpha).toBe(0.5);
    expect(result.current.rgb.a).toBe(0.5);
  });

  it('updates color with alpha from RGB object', () => {
    const { result } = renderHook(() => 
      useColorPicker({ defaultValue: '#ff0000', showAlpha: true })
    );
    
    act(() => {
      result.current.setColor({ r: 0, g: 255, b: 0, a: 0.5 });
    });
    
    expect(result.current.rgb.r).toBe(0);
    expect(result.current.rgb.g).toBe(255);
    expect(result.current.rgb.b).toBe(0);
    expect(result.current.rgb.a).toBe(0.5);
    expect(result.current.alpha).toBe(0.5);
  });
});

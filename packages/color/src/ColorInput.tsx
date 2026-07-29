import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import type { ColorInputProps, ColorPreset } from './types';
import { formatColor, isValidColor, getContrastText, rgbToHsv } from './utils';
import { useColorPicker } from './useColorPicker';

/**
 * Default color presets
 */
export const defaultPresets: ColorPreset[] = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ff0000' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Gray', value: '#808080' },
  { name: 'Orange', value: '#ffa500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Pink', value: '#ffc0cb' },
];

/**
 * Headless Color Input Component
 * 
 * Provides a fully accessible color picker with keyboard navigation and ARIA support.
 * This is a headless component - you need to provide your own styling.
 * 
 * @example
 * ```tsx
 * <ColorInput
 *   value={color}
 *   onChange={setColor}
 *   format="hex"
 *   showAlpha
 * />
 * ```
 */
export function ColorInput(props: ColorInputProps): React.ReactElement {
  const {
    value,
    onChange,
    format = 'hex',
    showAlpha = false,
    presets = defaultPresets,
    disabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    id: propId,
    placeholder = 'Enter color...',
    className,
    style,
  } = props;

  const uniqueId = useId();
  const id = propId || `color-input-${uniqueId}`;
  const inputId = `${id}-input`;
  const pickerId = `${id}-picker`;
  const presetsId = `${id}-presets`;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstPresetRef = useRef<HTMLButtonElement>(null);

  const { color, setColor, hex, rgb, hsl, alpha, setAlpha } = useColorPicker({
    defaultValue: value || '#007acc',
    format,
    showAlpha,
  });

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
      if (isValidColor(value)) {
        setColor(value);
      }
    }
  }, [value]);

  // Update input when color changes internally
  useEffect(() => {
    const formatted = formatColor(rgb, format, { showAlpha });
    setInputValue(formatted);
    if (onChange && formatted !== value) {
      onChange(formatted);
    }
  }, [color, format, showAlpha]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Use rAF so the DOM has rendered before we attempt focus
      const raf = requestAnimationFrame(() => firstPresetRef.current?.focus());
      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (isValidColor(newValue)) {
      setColor(newValue);
    }
  }, [setColor]);

  const handleInputBlur = useCallback(() => {
    if (!isValidColor(inputValue)) {
      // Reset to current color if invalid
      setInputValue(formatColor(rgb, format, { showAlpha }));
    }
  }, [inputValue, rgb, format, showAlpha]);

  const handlePresetClick = useCallback((presetValue: string) => {
    setColor(presetValue);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [setColor]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.focus();
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
          e.preventDefault();
        }
        break;
      case 'Enter':
        setIsOpen(!isOpen);
        break;
    }
  }, [isOpen]);

  const handlePresetKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const presetButtons = containerRef.current?.querySelectorAll('[data-preset-button]');
    const totalPresets = presetButtons?.length || presets.length;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (index < totalPresets - 1) {
          (presetButtons?.[index + 1] as HTMLButtonElement)?.focus();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          (presetButtons?.[index - 1] as HTMLButtonElement)?.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Move to next row (assuming 6 columns)
        if (index + 6 < totalPresets) {
          (presetButtons?.[index + 6] as HTMLButtonElement)?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Move to previous row
        if (index - 6 >= 0) {
          (presetButtons?.[index - 6] as HTMLButtonElement)?.focus();
        } else {
          // Move back to input
          inputRef.current?.focus();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handlePresetClick(presets[index].value);
        break;
    }
  }, [presets, handlePresetClick]);

  const displayColor = isValidColor(inputValue) ? inputValue : hex;
  const contrastText = getContrastText(displayColor);
  const isValid = isValidColor(inputValue);

  // Render functions for headless usage
  const getInputProps = () => ({
    ref: inputRef,
    id: inputId,
    type: 'text',
    value: inputValue,
    onChange: handleInputChange,
    onBlur: handleInputBlur,
    onKeyDown: handleKeyDown,
    disabled,
    placeholder,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? pickerId : undefined,
    'aria-haspopup': 'dialog' as const,
    'aria-invalid': !isValid,
  });

  const getToggleProps = () => ({
    type: 'button' as const,
    onClick: () => !disabled && setIsOpen(!isOpen),
    disabled,
    'aria-label': 'Toggle color picker',
    'aria-expanded': isOpen,
    'aria-controls': pickerId,
  });

  const getPickerProps = () => ({
    id: pickerId,
    role: 'dialog' as const,
    'aria-label': 'Color picker',
    hidden: !isOpen,
  });

  const getPresetProps = (preset: ColorPreset, index: number) => ({
    ref: index === 0 ? firstPresetRef : undefined,
    type: 'button' as const,
    'data-preset-button': true,
    onClick: () => handlePresetClick(preset.value),
    onKeyDown: (e: React.KeyboardEvent) => handlePresetKeyDown(e, index),
    'aria-label': `Select ${preset.name} color`,
    disabled,
  });

  const getAlphaSliderProps = () => ({
    type: 'range' as const,
    min: 0,
    max: 1,
    step: 0.01,
    value: alpha,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAlpha(parseFloat(e.target.value)),
    disabled,
    'aria-label': 'Alpha transparency',
    'aria-valuemin': 0,
    'aria-valuemax': 1,
    'aria-valuenow': alpha,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Color preview and input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          {...getToggleProps()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            border: '2px solid #ccc',
            backgroundColor: displayColor,
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Color preview</span>
        </button>
        <input
          {...getInputProps()}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: `2px solid ${isValid ? '#ccc' : '#ff0000'}`,
            fontSize: '14px',
            fontFamily: 'monospace',
            width: '150px',
          }}
        />
      </div>

      {/* Color picker dropdown */}
      {isOpen && (
        <div
          {...getPickerProps()}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '240px',
          }}
        >
          {/* Color info */}
          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666' }}>
            <div>HEX: {hex}</div>
            <div>RGB: {rgb.r}, {rgb.g}, {rgb.b}</div>
            <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>
          </div>

          {/* Alpha slider */}
          {showAlpha && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                Alpha: {Math.round(alpha * 100)}%
              </label>
              <input
                {...getAlphaSliderProps()}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Presets */}
          <div
            id={presetsId}
            role="group"
            aria-label="Color presets"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
            }}
          >
            {presets.map((preset, index) => (
              <button
                key={preset.value}
                {...getPresetProps(preset, index)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  border: '2px solid transparent',
                  backgroundColor: preset.value,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007acc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              />
            ))}
          </div>

          {/* Current color preview */}
          <div
            style={{
              marginTop: '16px',
              padding: '8px',
              backgroundColor: displayColor,
              color: contrastText,
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Current Color
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to get headless color input props
 * Use this for complete custom styling
 */
export function useColorInput(props: ColorInputProps) {
  const {
    value,
    onChange,
    format = 'hex',
    showAlpha = false,
    presets = defaultPresets,
    disabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    id: propId,
    placeholder = 'Enter color...',
  } = props;

  const uniqueId = React.useId();
  const id = propId || `color-input-${uniqueId}`;
  const inputId = `${id}-input`;
  const pickerId = `${id}-picker`;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  const { color, setColor, hex, rgb, hsl, alpha, setAlpha } = useColorPicker({
    defaultValue: value || '#007acc',
    format,
    showAlpha,
  });

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
      if (isValidColor(value)) {
        setColor(value);
      }
    }
  }, [value]);

  // Update input when color changes internally
  useEffect(() => {
    const formatted = formatColor(rgb, format, { showAlpha });
    setInputValue(formatted);
    if (onChange && formatted !== value) {
      onChange(formatted);
    }
  }, [color, format, showAlpha]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (isValidColor(newValue)) {
      setColor(newValue);
    }
  }, [setColor]);

  const handleInputBlur = useCallback(() => {
    if (!isValidColor(inputValue)) {
      setInputValue(formatColor(rgb, format, { showAlpha }));
    }
  }, [inputValue, rgb, format, showAlpha]);

  const handlePresetClick = useCallback((presetValue: string) => {
    setColor(presetValue);
    setIsOpen(false);
  }, [setColor]);

  const displayColor = isValidColor(inputValue) ? inputValue : hex;
  const isValid = isValidColor(inputValue);

  // contrastText is calculated but not used in headless hook return
  void getContrastText(displayColor);

  return {
    // State
    color: displayColor,
    hex,
    rgb,
    hsl,
    hsv: rgbToHsv(rgb),
    alpha,
    isOpen,
    isValid,
    inputValue,
    presets,
    
    // Refs
    containerRef,
    
    // Actions
    setIsOpen,
    setColor,
    setAlpha,
    handleInputChange,
    handleInputBlur,
    handlePresetClick,
    
    // Props getters
    getInputProps: () => ({
      id: inputId,
      type: 'text' as const,
      value: inputValue,
      onChange: handleInputChange,
      onBlur: handleInputBlur,
      disabled,
      placeholder,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? pickerId : undefined,
      'aria-haspopup': 'dialog' as const,
      'aria-invalid': !isValid,
    }),
    
    getToggleProps: () => ({
      type: 'button' as const,
      onClick: () => !disabled && setIsOpen(!isOpen),
      disabled,
      'aria-label': 'Toggle color picker',
      'aria-expanded': isOpen,
      'aria-controls': pickerId,
    }),
    
    getPickerProps: () => ({
      id: pickerId,
      role: 'dialog' as const,
      'aria-label': 'Color picker',
      hidden: !isOpen,
    }),
    
    getPresetProps: (preset: ColorPreset, _index: number) => ({
      type: 'button' as const,
      onClick: () => handlePresetClick(preset.value),
      'aria-label': `Select ${preset.name} color`,
      disabled,
    }),
    
    getAlphaSliderProps: () => ({
      type: 'range' as const,
      min: 0,
      max: 1,
      step: 0.01,
      value: alpha,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAlpha(parseFloat(e.target.value)),
      disabled,
      'aria-label': 'Alpha transparency',
    }),
  };
}

export default ColorInput;

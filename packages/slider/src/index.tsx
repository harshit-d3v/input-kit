// @input-kit/slider - Range slider component

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  MouseEvent,
  TouchEvent,
  KeyboardEvent,
} from 'react';

// Types
export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showTooltip?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  marks?: { value: number; label?: string }[];
  formatValue?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
  trackClassName?: string;
  thumbClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface RangeSliderProps {
  value?: [number, number];
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface UseSliderOptions {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

export interface UseSliderReturn {
  value: number;
  percentage: number;
  isDragging: boolean;
  trackRef: React.RefObject<HTMLDivElement>;
  thumbRef: React.RefObject<HTMLDivElement>;
  getTrackProps: () => {
    ref: React.RefObject<HTMLDivElement>;
    onMouseDown: (e: MouseEvent) => void;
    onTouchStart: (e: TouchEvent) => void;
  };
  getThumbProps: () => {
    ref: React.RefObject<HTMLDivElement>;
    role: string;
    tabIndex: number;
    'aria-valuenow': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-orientation': 'horizontal' | 'vertical';
    onKeyDown: (e: KeyboardEvent) => void;
  };
}

// Utility functions
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value: number, step: number, min: number): number {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

function getPercentage(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

function getValueFromPosition(
  position: number,
  trackSize: number,
  min: number,
  max: number,
  step: number,
  orientation: 'horizontal' | 'vertical'
): number {
  let percentage = position / trackSize;
  if (orientation === 'vertical') {
    percentage = 1 - percentage;
  }
  
  const rawValue = min + percentage * (max - min);
  return roundToStep(clamp(rawValue, min, max), step, min);
}

// Hook
export function useSlider(options: UseSliderOptions = {}): UseSliderReturn {
  const {
    min = 0,
    max = 100,
    step = 1,
    defaultValue = min,
    value: controlledValue,
    onChange,
    onChangeEnd,
    orientation = 'horizontal',
    disabled = false,
  } = options;
  
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const percentage = getPercentage(value, min, max);
  
  const updateValue = useCallback((newValue: number) => {
    const clamped = clamp(roundToStep(newValue, step, min), min, max);
    
    if (controlledValue === undefined) {
      setInternalValue(clamped);
    }
    onChange?.(clamped);
  }, [controlledValue, min, max, step, onChange]);
  
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (disabled || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const position = orientation === 'horizontal' 
      ? clientX - rect.left 
      : clientY - rect.top;
    const size = orientation === 'horizontal' ? rect.width : rect.height;
    
    const newValue = getValueFromPosition(position, size, min, max, step, orientation);
    updateValue(newValue);
  }, [disabled, min, max, step, orientation, updateValue]);
  
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  }, [disabled, handleMove]);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    if (!touch) return;

    setIsDragging(true);
    handleMove(touch.clientX, touch.clientY);
  }, [disabled, handleMove]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;
    
    let newValue = value;
    const bigStep = step * 10;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = value + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = value - step;
        break;
      case 'PageUp':
        e.preventDefault();
        newValue = value + bigStep;
        break;
      case 'PageDown':
        e.preventDefault();
        newValue = value - bigStep;
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }
    
    updateValue(newValue);
    onChangeEnd?.(clamp(roundToStep(newValue, step, min), min, max));
  }, [disabled, value, min, max, step, updateValue, onChangeEnd]);
  
  // Global mouse/touch events
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e: globalThis.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      onChangeEnd?.(value);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove, onChangeEnd, value]);
  
  return {
    value,
    percentage,
    isDragging,
    trackRef,
    thumbRef,
    getTrackProps: () => ({
      ref: trackRef,
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    }),
    getThumbProps: () => ({
      ref: thumbRef,
      role: 'slider',
      tabIndex: disabled ? -1 : 0,
      'aria-valuenow': value,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-orientation': orientation,
      onKeyDown: handleKeyDown,
    }),
  };
}

// Slider Component
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  function Slider(props, ref) {
    const {
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      onChangeEnd,
      disabled = false,
      orientation = 'horizontal',
      showTooltip = false,
      showTicks = false,
      tickCount = 5,
      marks,
      formatValue = (v) => v.toString(),
      className,
      style,
      trackClassName,
      thumbClassName,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    } = props;
    
    const slider = useSlider({
      min,
      max,
      step,
      value,
      defaultValue,
      onChange,
      onChangeEnd,
      orientation,
      disabled,
    });
    
    const isHorizontal = orientation === 'horizontal';
    const trackStyle: React.CSSProperties = isHorizontal
      ? { width: '100%', height: '8px' }
      : { width: '8px', height: '200px' };
    
    const fillStyle: React.CSSProperties = isHorizontal
      ? { width: `${slider.percentage}%`, height: '100%' }
      : { width: '100%', height: `${slider.percentage}%`, bottom: 0 };
    
    const thumbStyle: React.CSSProperties = isHorizontal
      ? { left: `${slider.percentage}%`, top: '50%', transform: 'translate(-50%, -50%)' }
      : { bottom: `${slider.percentage}%`, left: '50%', transform: 'translate(-50%, 50%)' };
    
    // `tickCount` of 1 made `i / (tickCount - 1)` a 0/0 NaN, emitting `left: NaN%`.
    const ticks = showTicks && tickCount > 0
      ? tickCount === 1
        ? [0]
        : Array.from({ length: tickCount }, (_, i) => (i / (tickCount - 1)) * 100)
      : [];
    
    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          ...style,
        }}
      >
        {/* Track */}
        <div
          {...slider.getTrackProps()}
          className={trackClassName}
          style={{
            position: 'relative',
            background: '#e5e7eb',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            // Without this the browser claims the gesture for scrolling and the
            // slider cannot be dragged on a touch device at all.
            touchAction: 'none',
            ...trackStyle,
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              background: disabled ? '#9ca3af' : '#3b82f6',
              borderRadius: '4px',
              ...fillStyle,
            }}
          />
          
          {/* Ticks */}
          {showTicks && ticks.map((tick, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                background: '#9ca3af',
                ...(isHorizontal
                  ? { left: `${tick}%`, top: '100%', width: '2px', height: '8px', marginTop: '4px', transform: 'translateX(-50%)' }
                  : { bottom: `${tick}%`, left: '100%', width: '8px', height: '2px', marginLeft: '4px', transform: 'translateY(50%)' }
                ),
              }}
            />
          ))}
          
          {/* Marks */}
          {marks?.map((mark, i) => {
            const markPercent = getPercentage(mark.value, min, max);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  ...(isHorizontal
                    ? { left: `${markPercent}%`, top: '100%', marginTop: '12px', transform: 'translateX(-50%)' }
                    : { bottom: `${markPercent}%`, left: '100%', marginLeft: '12px', transform: 'translateY(50%)' }
                  ),
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                {mark.label ?? mark.value}
              </div>
            );
          })}
          
          {/* Thumb */}
          <div
            {...slider.getThumbProps()}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-valuetext={formatValue(slider.value)}
            className={thumbClassName}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'white',
              border: '2px solid',
              borderColor: disabled ? '#9ca3af' : '#3b82f6',
              borderRadius: '50%',
              cursor: disabled ? 'not-allowed' : 'grab',
              outline: 'none',
              boxShadow: slider.isDragging ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.15s',
              ...thumbStyle,
            }}
          >
            {/* Tooltip */}
            {showTooltip && slider.isDragging && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  padding: '4px 8px',
                  background: '#1f2937',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatValue(slider.value)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Range Slider Component
export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  function RangeSlider(props, ref) {
    const {
      value: controlledValue,
      defaultValue = [25, 75],
      min = 0,
      max = 100,
      step = 1,
      minDistance = 0,
      onChange,
      onChangeEnd,
      disabled = false,
      orientation = 'horizontal',
      showTooltip = false,
      formatValue = (v) => v.toString(),
      className,
      style,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    } = props;
    
    const [internalValue, setInternalValue] = useState<[number, number]>(defaultValue);
    const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const [lowValue, highValue] = value;
    
    const lowPercent = getPercentage(lowValue, min, max);
    const highPercent = getPercentage(highValue, min, max);
    
    const isHorizontal = orientation === 'horizontal';

    const getConstrainedValues = useCallback((thumbIndex: 0 | 1, newValue: number): [number, number] => {
      const clamped = clamp(roundToStep(newValue, step, min), min, max);

      let newLow = thumbIndex === 0 ? clamped : lowValue;
      let newHigh = thumbIndex === 1 ? clamped : highValue;

      if (newHigh - newLow < minDistance) {
        if (thumbIndex === 0) {
          newLow = Math.min(newLow, newHigh - minDistance);
        } else {
          newHigh = Math.max(newHigh, newLow + minDistance);
        }
      }

      if (newLow > newHigh) {
        [newLow, newHigh] = [newHigh, newLow];
      }

      return [
        clamp(newLow, min, max),
        clamp(newHigh, min, max),
      ];
    }, [highValue, lowValue, max, min, minDistance, step]);
    
    const updateValue = useCallback((thumbIndex: 0 | 1, newValue: number) => {
      const newVal = getConstrainedValues(thumbIndex, newValue);
      
      if (controlledValue === undefined) {
        setInternalValue(newVal);
      }
      onChange?.(newVal);
      return newVal;
    }, [controlledValue, getConstrainedValues, onChange]);

    const handleThumbKeyDown = useCallback((thumbIndex: 0 | 1, currentValue: number) => (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      let nextValue = currentValue;
      const bigStep = step * 10;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          nextValue = currentValue + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          nextValue = currentValue - step;
          break;
        case 'PageUp':
          e.preventDefault();
          nextValue = currentValue + bigStep;
          break;
        case 'PageDown':
          e.preventDefault();
          nextValue = currentValue - bigStep;
          break;
        case 'Home':
          e.preventDefault();
          nextValue = thumbIndex === 0 ? min : lowValue + minDistance;
          break;
        case 'End':
          e.preventDefault();
          nextValue = thumbIndex === 0 ? highValue - minDistance : max;
          break;
        default:
          return;
      }

      const nextValues = updateValue(thumbIndex, nextValue);
      onChangeEnd?.(nextValues);
    }, [disabled, highValue, lowValue, max, min, minDistance, onChangeEnd, step, updateValue]);
    
    const handleTrackClick = useCallback((e: MouseEvent) => {
      if (disabled || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const position = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;
      const size = isHorizontal ? rect.width : rect.height;
      const clickValue = getValueFromPosition(position, size, min, max, step, orientation);
      
      // Determine which thumb to move
      const distToLow = Math.abs(clickValue - lowValue);
      const distToHigh = Math.abs(clickValue - highValue);
      
      if (distToLow < distToHigh) {
        updateValue(0, clickValue);
        setActiveThumb(0);
      } else {
        updateValue(1, clickValue);
        setActiveThumb(1);
      }
    }, [disabled, isHorizontal, min, max, step, orientation, lowValue, highValue, updateValue]);
    
    // Mouse/touch move handling
    useEffect(() => {
      if (activeThumb === null) return;
      
      const handleMove = (clientX: number, clientY: number) => {
        if (!trackRef.current) return;
        
        const rect = trackRef.current.getBoundingClientRect();
        const position = isHorizontal ? clientX - rect.left : clientY - rect.top;
        const size = isHorizontal ? rect.width : rect.height;
        const newValue = getValueFromPosition(position, size, min, max, step, orientation);
        
        updateValue(activeThumb, newValue);
      };
      
      const handleMouseMove = (e: globalThis.MouseEvent) => handleMove(e.clientX, e.clientY);
      const handleTouchMove = (e: globalThis.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      };
      
      const handleEnd = () => {
        setActiveThumb(null);
        onChangeEnd?.(value);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }, [activeThumb, isHorizontal, min, max, step, orientation, updateValue, onChangeEnd, value]);
    
    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          ...style,
        }}
      >
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          style={{
            position: 'relative',
            background: '#e5e7eb',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            touchAction: 'none',
            ...(isHorizontal ? { width: '100%', height: '8px' } : { width: '8px', height: '200px' }),
          }}
        >
          {/* Range fill */}
          <div
            style={{
              position: 'absolute',
              background: disabled ? '#9ca3af' : '#3b82f6',
              borderRadius: '4px',
              ...(isHorizontal
                ? { left: `${lowPercent}%`, width: `${highPercent - lowPercent}%`, height: '100%' }
                : { bottom: `${lowPercent}%`, height: `${highPercent - lowPercent}%`, width: '100%' }
              ),
            }}
          />
          
          {/* Low thumb */}
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={lowValue}
            aria-valuemin={min}
            aria-valuemax={highValue - minDistance}
            aria-valuetext={formatValue(lowValue)}
            aria-orientation={orientation}
            aria-label={ariaLabel ? `${ariaLabel} minimum` : 'Minimum value'}
            aria-labelledby={ariaLabelledBy}
            onMouseDown={() => !disabled && setActiveThumb(0)}
            onTouchStart={() => !disabled && setActiveThumb(0)}
            onKeyDown={handleThumbKeyDown(0, lowValue)}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'white',
              border: '2px solid',
              borderColor: disabled ? '#9ca3af' : '#3b82f6',
              borderRadius: '50%',
              cursor: disabled ? 'not-allowed' : 'grab',
              outline: 'none',
              boxShadow: activeThumb === 0 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: activeThumb === 0 ? 2 : 1,
              ...(isHorizontal
                ? { left: `${lowPercent}%`, top: '50%', transform: 'translate(-50%, -50%)' }
                : { bottom: `${lowPercent}%`, left: '50%', transform: 'translate(-50%, 50%)' }
              ),
            }}
          >
            {showTooltip && activeThumb === 0 && (
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', padding: '4px 8px', background: '#1f2937', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                {formatValue(lowValue)}
              </div>
            )}
          </div>
          
          {/* High thumb */}
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={highValue}
            aria-valuemin={lowValue + minDistance}
            aria-valuemax={max}
            aria-valuetext={formatValue(highValue)}
            aria-orientation={orientation}
            aria-label={ariaLabel ? `${ariaLabel} maximum` : 'Maximum value'}
            aria-labelledby={ariaLabelledBy}
            onMouseDown={() => !disabled && setActiveThumb(1)}
            onTouchStart={() => !disabled && setActiveThumb(1)}
            onKeyDown={handleThumbKeyDown(1, highValue)}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'white',
              border: '2px solid',
              borderColor: disabled ? '#9ca3af' : '#3b82f6',
              borderRadius: '50%',
              cursor: disabled ? 'not-allowed' : 'grab',
              outline: 'none',
              boxShadow: activeThumb === 1 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: activeThumb === 1 ? 2 : 1,
              ...(isHorizontal
                ? { left: `${highPercent}%`, top: '50%', transform: 'translate(-50%, -50%)' }
                : { bottom: `${highPercent}%`, left: '50%', transform: 'translate(-50%, 50%)' }
              ),
            }}
          >
            {showTooltip && activeThumb === 1 && (
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', padding: '4px 8px', background: '#1f2937', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                {formatValue(highValue)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

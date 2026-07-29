// @input-kit/gauge - Gauge/meter components

import React, { useMemo } from 'react';

// Types
export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  colors?: { value: number; color: string }[];
  backgroundColor?: string;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface LinearGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  width?: number;
  height?: number;
  colors?: { value: number; color: string }[];
  backgroundColor?: string;
  animated?: boolean;
  vertical?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Utility functions
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

function getColorForValue(
  value: number,
  colors: { value: number; color: string }[]
): string {
  if (colors.length === 0) return '#3b82f6';
  
  const sorted = [...colors].sort((a, b) => a.value - b.value);
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (value >= sorted[i].value) {
      return sorted[i].color;
    }
  }
  
  return sorted[0].color;
}

function normalizeGaugeValue(value: number, min: number, max: number) {
  if (max <= min) {
    return {
      clampedValue: min,
      percentage: 0,
    };
  }

  const clampedValue = Math.max(min, Math.min(max, value));

  return {
    clampedValue,
    percentage: (clampedValue - min) / (max - min),
  };
}

// Circular Gauge Component
export function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  showValue = true,
  valueFormatter = (v) => v.toFixed(0),
  size = 200,
  thickness = 20,
  startAngle = -135,
  endAngle = 135,
  colors = [
    { value: 0, color: '#22c55e' },
    { value: 50, color: '#eab308' },
    { value: 75, color: '#ef4444' },
  ],
  backgroundColor = '#e5e7eb',
  animated = true,
  className,
  style,
}: GaugeProps) {
  const center = size / 2;
  const radius = (size - thickness) / 2;

  const { clampedValue, percentage } = normalizeGaugeValue(value, min, max);
  const valueAngle = startAngle + percentage * (endAngle - startAngle);
  
  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
  const valueArc = describeArc(center, center, radius, startAngle, valueAngle);
  const color = getColorForValue(percentage * 100, colors);
  
  // Needle position
  const needleLength = radius - 10;
  const needlePos = polarToCartesian(center, center, needleLength, valueAngle);

  return (
    <div className={className} style={{ display: 'inline-block', ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <path
          d={backgroundArc}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <path
          d={valueArc}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={animated ? {
            transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease',
          } : undefined}
        />
        
        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={needlePos.x}
          y2={needlePos.y}
          stroke="#374151"
          strokeWidth={3}
          strokeLinecap="round"
          style={animated ? {
            transition: 'all 0.5s ease-out',
          } : undefined}
        />
        
        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={8}
          fill="#374151"
        />
        
        {/* Value text */}
        {showValue && (
          <text
            x={center}
            y={center + 40}
            textAnchor="middle"
            fontSize={size * 0.15}
            fontWeight="bold"
            fill="#111827"
          >
            {valueFormatter(clampedValue)}
          </text>
        )}
        
        {/* Label */}
        {label && (
          <text
            x={center}
            y={center + 60}
            textAnchor="middle"
            fontSize={size * 0.08}
            fill="#6b7280"
          >
            {label}
          </text>
        )}
        
        {/* Min/Max labels */}
        <text
          x={polarToCartesian(center, center, radius + 15, startAngle).x}
          y={polarToCartesian(center, center, radius + 15, startAngle).y}
          textAnchor="middle"
          fontSize={size * 0.06}
          fill="#9ca3af"
        >
          {min}
        </text>
        <text
          x={polarToCartesian(center, center, radius + 15, endAngle).x}
          y={polarToCartesian(center, center, radius + 15, endAngle).y}
          textAnchor="middle"
          fontSize={size * 0.06}
          fill="#9ca3af"
        >
          {max}
        </text>
      </svg>
    </div>
  );
}

// Linear Gauge Component
export function LinearGauge({
  value,
  min = 0,
  max = 100,
  label,
  showValue = true,
  valueFormatter = (v) => v.toFixed(0),
  width = 200,
  height = 24,
  colors = [
    { value: 0, color: '#22c55e' },
    { value: 50, color: '#eab308' },
    { value: 75, color: '#ef4444' },
  ],
  backgroundColor = '#e5e7eb',
  animated = true,
  vertical = false,
  showTicks = false,
  tickCount = 5,
  className,
  style,
}: LinearGaugeProps) {
  const { clampedValue, percentage } = normalizeGaugeValue(value, min, max);
  const percentageValue = percentage * 100;
  const color = getColorForValue(percentageValue, colors);
  
  const ticks = useMemo(() => {
    if (!showTicks || tickCount <= 0) return [];
    if (tickCount === 1 || max <= min) {
      return [{ value: min, position: 0 }];
    }

    return Array.from({ length: tickCount }, (_, i) => {
      const tickValue = min + (max - min) * (i / (tickCount - 1));
      return {
        value: tickValue,
        position: (i / (tickCount - 1)) * 100,
      };
    });
  }, [showTicks, tickCount, min, max]);

  if (vertical) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          ...style,
        }}
      >
        {label && (
          <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <div
            style={{
              width: height,
              height: width,
              background: backgroundColor,
              borderRadius: height / 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${percentageValue}%`,
                background: color,
                borderRadius: height / 2,
                transition: animated ? 'height 0.5s ease-out, background 0.3s ease' : undefined,
              }}
            />
          </div>
          {showTicks && (
            <div style={{ height: width, display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between' }}>
              {ticks.map((tick, i) => (
                <span key={i} style={{ fontSize: '10px', color: '#9ca3af' }}>
                  {valueFormatter(tick.value)}
                </span>
              ))}
            </div>
          )}
        </div>
        {showValue && (
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            {valueFormatter(clampedValue)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '8px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>
        )}
        {showValue && (
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
            {valueFormatter(clampedValue)}
          </span>
        )}
      </div>
      <div
        style={{
          width,
          height,
          background: backgroundColor,
          borderRadius: height / 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${percentage}%`,
            background: color,
            borderRadius: height / 2,
            transition: animated ? 'width 0.5s ease-out, background 0.3s ease' : undefined,
          }}
        />
      </div>
      {showTicks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', width }}>
          {ticks.map((tick, i) => (
            <span key={i} style={{ fontSize: '10px', color: '#9ca3af' }}>
              {valueFormatter(tick.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Semi-circular Gauge
export function SemiGauge({
  value,
  min = 0,
  max = 100,
  label,
  showValue = true,
  valueFormatter = (v) => v.toFixed(0),
  size = 200,
  thickness = 20,
  colors = [
    { value: 0, color: '#22c55e' },
    { value: 50, color: '#eab308' },
    { value: 75, color: '#ef4444' },
  ],
  backgroundColor = '#e5e7eb',
  animated = true,
  className,
  style,
}: GaugeProps) {
  return (
    <Gauge
      value={value}
      min={min}
      max={max}
      label={label}
      showValue={showValue}
      valueFormatter={valueFormatter}
      size={size}
      thickness={thickness}
      startAngle={-180}
      endAngle={0}
      colors={colors}
      backgroundColor={backgroundColor}
      animated={animated}
      className={className}
      style={style}
    />
  );
}

// Hook for animated gauge value
export function useGaugeAnimation(
  targetValue: number,
  duration: number = 500
): number {
  const [displayValue, setDisplayValue] = React.useState(targetValue);
  const animationRef = React.useRef<number>();
  const startTimeRef = React.useRef<number>();
  const startValueRef = React.useRef<number>(targetValue);

  React.useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValueRef.current + (targetValue - startValueRef.current) * eased;
      setDisplayValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
}

// Export utilities
export { polarToCartesian, describeArc, getColorForValue };

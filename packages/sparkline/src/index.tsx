// @input-kit/sparkline - Sparkline chart components

import React, { useId, useMemo } from 'react';

// Types
export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  limit?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  curved?: boolean;
  showDots?: boolean;
  dotRadius?: number;
  showEndDot?: boolean;
  showMinMax?: boolean;
  minColor?: string;
  maxColor?: string;
  animated?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface SparkBarProps {
  data: number[];
  width?: number;
  height?: number;
  limit?: number;
  barWidth?: number;
  gap?: number;
  fill?: string;
  negativeFill?: string;
  radius?: number;
  animated?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface SparkAreaProps extends SparklineProps {
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

// Utility functions
function normalizeData(data: number[]): { values: number[]; min: number; max: number } {
  if (data.length === 0) return { values: [], min: 0, max: 0 };
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const values = data.map(v => (v - min) / range);
  
  return { values, min, max };
}

function createPath(
  points: { x: number; y: number }[],
  curved: boolean
): string {
  if (points.length === 0) return '';
  
  if (!curved) {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }
  
  // Create smooth bezier curve
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  
  return path;
}

interface SparklineGeometry {
  sourceData: number[];
  min: number;
  max: number;
  points: Array<{
    x: number;
    y: number;
    value: number;
    isMin: boolean;
    isMax: boolean;
  }>;
  linePath: string;
  pathLength: number;
}

function createAreaPath(linePath: string, points: SparklineGeometry['points'], height: number) {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

function getSparklineGeometry({
  data,
  limit,
  width,
  height,
  strokeWidth,
  showDots,
  showEndDot,
  dotRadius,
  curved,
}: {
  data: number[];
  limit?: number;
  width: number;
  height: number;
  strokeWidth: number;
  showDots: boolean;
  showEndDot: boolean;
  dotRadius: number;
  curved: boolean;
}): SparklineGeometry {
  const sourceData = limit && limit > 0 ? data.slice(-limit) : data;
  const { values, min, max } = normalizeData(sourceData);

  if (sourceData.length === 0) {
    return {
      sourceData: [],
      min,
      max,
      points: [],
      linePath: '',
      pathLength: 0,
    };
  }

  const padding = strokeWidth + (showDots || showEndDot ? dotRadius : 0);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Mark the first occurrence only. Comparing by value meant a series with a repeated
  // low drew a marker at every one of them, and a flat series marked every point.
  const minIndex = sourceData.indexOf(min);
  const maxIndex = sourceData.indexOf(max);

  const points = values.map((value, index) => ({
    x: padding + (index / (values.length - 1 || 1)) * chartWidth,
    y: padding + (1 - value) * chartHeight,
    value: sourceData[index],
    isMin: index === minIndex,
    isMax: index === maxIndex,
  }));

  const linePath = createPath(points, curved);
  const pathLength = points.reduce((length, point, index) => {
    if (index === 0) return 0;
    const previous = points[index - 1];
    return length + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

  return {
    sourceData,
    min,
    max,
    points,
    linePath,
    pathLength,
  };
}

function renderSparklineGraphic({
  geometry,
  height,
  stroke,
  strokeWidth,
  fill,
  fillOpacity,
  showDots,
  dotRadius,
  showEndDot,
  showMinMax,
  minColor,
  maxColor,
  animated,
}: {
  geometry: SparklineGeometry;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
  showDots: boolean;
  dotRadius: number;
  showEndDot: boolean;
  showMinMax: boolean;
  minColor: string;
  maxColor: string;
  animated: boolean;
}) {
  const areaPath = fill === 'none' ? '' : createAreaPath(geometry.linePath, geometry.points, height);

  return (
    <>
      {fill !== 'none' && (
        <path
          d={areaPath}
          fill={fill}
          fillOpacity={fillOpacity}
        />
      )}

      <path
        d={geometry.linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        // `pathLength` normalises the rendered path to 100 units, so the dash maths
        // is exact whatever the geometry. `geometry.pathLength` sums straight-line
        // distances between points, which undershoots a bezier — and `curved`
        // defaults to true, so the animation used to start part-drawn.
        pathLength={animated ? 100 : undefined}
        style={animated ? {
          strokeDasharray: 100,
          strokeDashoffset: 100,
          animation: 'sparkline-draw 1s ease-out forwards',
        } : undefined}
      />

      {showDots && geometry.points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={dotRadius}
          fill={
            showMinMax && point.isMin ? minColor :
            showMinMax && point.isMax ? maxColor :
            stroke
          }
        />
      ))}

      {showEndDot && !showDots && geometry.points.length > 0 && (
        <circle
          cx={geometry.points[geometry.points.length - 1].x}
          cy={geometry.points[geometry.points.length - 1].y}
          r={dotRadius + 1}
          fill={stroke}
        />
      )}

      {showMinMax && !showDots && geometry.points.map((point, index) => (
        (point.isMin || point.isMax) && (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={dotRadius + 1}
            fill={point.isMin ? minColor : maxColor}
          />
        )
      ))}

      {animated && (
        <style>{`
          @keyframes sparkline-draw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}
    </>
  );
}

// Sparkline Component
export function Sparkline({
  data,
  width = 100,
  height = 30,
  limit,
  stroke = '#3b82f6',
  strokeWidth = 2,
  fill = 'none',
  fillOpacity = 0.1,
  curved = true,
  showDots = false,
  dotRadius = 2,
  showEndDot = false,
  showMinMax = false,
  minColor = '#ef4444',
  maxColor = '#22c55e',
  animated = false,
  label,
  className,
  style,
}: SparklineProps) {
  const geometry = useMemo(() => getSparklineGeometry({
    data,
    limit,
    width,
    height,
    strokeWidth,
    showDots,
    showEndDot,
    dotRadius,
    curved,
  }), [curved, data, dotRadius, height, limit, showDots, showEndDot, strokeWidth, width]);

  if (geometry.sourceData.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {label && <title>{label}</title>}
      {renderSparklineGraphic({
        geometry,
        height,
        stroke,
        strokeWidth,
        fill,
        fillOpacity,
        showDots,
        dotRadius,
        showEndDot,
        showMinMax,
        minColor,
        maxColor,
        animated,
      })}
    </svg>
  );
}

// Spark Area (with gradient fill)
export function SparkArea({
  data,
  width = 100,
  height = 30,
  limit,
  stroke = '#3b82f6',
  strokeWidth = 2,
  gradient = true,
  gradientFrom = '#3b82f6',
  gradientTo = 'transparent',
  curved = true,
  animated = false,
  label,
  className,
  style,
  ...rest
}: SparkAreaProps) {
  // useId, not Math.random: the random version produced a different id on the server
  // than on the client, so the `url(#…)` reference broke hydration.
  const gradientId = `spark-gradient-${useId().replace(/:/g, '')}`;
  const geometry = useMemo(() => getSparklineGeometry({
    data,
    limit,
    width,
    height,
    strokeWidth,
    showDots: rest.showDots ?? false,
    showEndDot: rest.showEndDot ?? false,
    dotRadius: rest.dotRadius ?? 2,
    curved,
  }), [curved, data, height, limit, rest.dotRadius, rest.showDots, rest.showEndDot, strokeWidth, width]);

  if (geometry.sourceData.length === 0) {
    return null;
  }
  
  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {label && <title>{label}</title>}
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientTo} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}

      {renderSparklineGraphic({
        geometry,
        height,
        stroke,
        strokeWidth,
        fill: gradient ? `url(#${gradientId})` : 'none',
        fillOpacity: rest.fillOpacity ?? 0.1,
        showDots: rest.showDots ?? false,
        dotRadius: rest.dotRadius ?? 2,
        showEndDot: rest.showEndDot ?? false,
        showMinMax: rest.showMinMax ?? false,
        minColor: rest.minColor ?? '#ef4444',
        maxColor: rest.maxColor ?? '#22c55e',
        animated,
      })}
    </svg>
  );
}

// Spark Bar Component
export function SparkBar({
  data,
  width = 100,
  height = 30,
  limit,
  barWidth,
  gap = 1,
  fill = '#3b82f6',
  negativeFill = '#ef4444',
  radius = 1,
  animated = false,
  label,
  className,
  style,
}: SparkBarProps) {
  const sourceData = useMemo(() => limit && limit > 0 ? data.slice(-limit) : data, [data, limit]);
  const { min, max } = useMemo(() => normalizeData(sourceData), [sourceData]);
  const hasNegative = min < 0;

  const bars = useMemo(() => {
    if (sourceData.length === 0) return [];

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const calculatedBarWidth = barWidth || (chartWidth - gap * (sourceData.length - 1)) / sourceData.length;

    // Bar height is the distance from the zero line, not the value's position across
    // the whole range. The old version scaled the normalised 0–1 position, so for
    // [-10, 0, 10] the zero bar rendered half height and the most-negative bar
    // rendered nothing at all.
    const baseY = hasNegative ? chartHeight / 2 + padding : height - padding;
    const scale = hasNegative
      ? (chartHeight / 2) / Math.max(Math.abs(min), Math.abs(max), 1)
      : chartHeight / (max || 1);

    return sourceData.map((value, i) => {
      const x = padding + i * (calculatedBarWidth + gap);
      const isNegative = value < 0;
      const barHeight = Math.abs(value) * scale;

      return {
        x,
        y: isNegative ? baseY : baseY - barHeight,
        width: calculatedBarWidth,
        height: barHeight,
        isNegative,
        value,
      };
    });
  }, [sourceData, width, height, barWidth, gap, hasNegative, min, max]);

  if (sourceData.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {label && <title>{label}</title>}
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.isNegative ? negativeFill : fill}
          rx={radius}
          style={animated ? {
            animation: `spark-bar-grow 0.5s ease-out ${i * 0.05}s forwards`,
            transform: 'scaleY(0)',
            transformBox: 'fill-box',
            transformOrigin: bar.isNegative ? 'center top' : 'center bottom',
          } : undefined}
        />
      ))}
      
      {/* Zero line for negative values */}
      {hasNegative && (
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#9ca3af"
          strokeWidth={0.5}
        />
      )}
      
      {animated && (
        <style>{`
          @keyframes spark-bar-grow {
            to {
              transform: scaleY(1);
            }
          }
        `}</style>
      )}
    </svg>
  );
}

// Inline Sparkline for text
export function InlineSparkline({
  data,
  width = 60,
  height = 16,
  stroke = 'currentColor',
  ...rest
}: Omit<SparklineProps, 'showDots' | 'showMinMax'>) {
  return (
    <Sparkline
      data={data}
      width={width}
      height={height}
      stroke={stroke}
      strokeWidth={1.5}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      {...rest}
    />
  );
}

// Sparkline with reference line
export function SparklineWithReference({
  data,
  referenceValue,
  referenceColor = '#9ca3af',
  ...rest
}: SparklineProps & { referenceValue: number; referenceColor?: string }) {
  const geometry = useMemo(() => getSparklineGeometry({
    data,
    limit: rest.limit,
    width: rest.width || 100,
    height: rest.height || 30,
    strokeWidth: rest.strokeWidth || 2,
    showDots: rest.showDots || false,
    showEndDot: rest.showEndDot || false,
    dotRadius: rest.dotRadius || 2,
    curved: rest.curved ?? true,
  }), [data, rest.curved, rest.dotRadius, rest.height, rest.limit, rest.showDots, rest.showEndDot, rest.strokeWidth, rest.width]);
  const refY = useMemo(() => {
    const range = geometry.max - geometry.min || 1;
    const normalized = (referenceValue - geometry.min) / range;
    const padding = (rest.strokeWidth || 2) + ((rest.showDots || rest.showEndDot) ? (rest.dotRadius || 2) : 0);
    const chartHeight = (rest.height || 30) - padding * 2;
    return padding + (1 - normalized) * chartHeight;
  }, [geometry.max, geometry.min, referenceValue, rest]);

  if (geometry.sourceData.length === 0) {
    return null;
  }

  return (
    <svg
      width={rest.width || 100}
      height={rest.height || 30}
      className={rest.className}
      style={rest.style}
      viewBox={`0 0 ${rest.width || 100} ${rest.height || 30}`}
      role={rest.label ? 'img' : undefined}
      aria-label={rest.label}
    >
      {rest.label && <title>{rest.label}</title>}
      {/* Reference line */}
      <line
        x1={0}
        y1={refY}
        x2={rest.width || 100}
        y2={refY}
        stroke={referenceColor}
        strokeWidth={1}
        strokeDasharray="3,3"
      />

      {renderSparklineGraphic({
        geometry,
        height: rest.height || 30,
        stroke: rest.stroke || '#3b82f6',
        strokeWidth: rest.strokeWidth || 2,
        fill: rest.fill || 'none',
        fillOpacity: rest.fillOpacity || 0.1,
        showDots: rest.showDots || false,
        dotRadius: rest.dotRadius || 2,
        showEndDot: rest.showEndDot || false,
        showMinMax: rest.showMinMax || false,
        minColor: rest.minColor || '#ef4444',
        maxColor: rest.maxColor || '#22c55e',
        animated: rest.animated || false,
      })}
    </svg>
  );
}

// Hook for sparkline data
export function useSparklineData(initialData: number[] = []) {
  const [data, setData] = React.useState<number[]>(initialData);
  
  const addPoint = React.useCallback((value: number, maxPoints?: number) => {
    setData(prev => {
      const newData = [...prev, value];
      if (maxPoints && newData.length > maxPoints) {
        return newData.slice(-maxPoints);
      }
      return newData;
    });
  }, []);
  
  const clear = React.useCallback(() => setData([]), []);
  
  const stats = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0, last: 0, trend: 0 };
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const last = data[data.length - 1];
    const first = data[0];
    const trend = data.length > 1 ? last - first : 0;
    
    return { min, max, avg, last, trend };
  }, [data]);
  
  return { data, setData, addPoint, clear, stats };
}

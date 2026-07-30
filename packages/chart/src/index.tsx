// @input-kit/chart - Lightweight SVG chart components

import React, { useMemo } from 'react';

// Types
export interface DataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: DataPoint[];
  color?: string;
}

export interface ChartProps {
  width?: number;
  height?: number;
  data: DataPoint[] | ChartSeries[];
  colors?: string[];
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface LineChartProps extends ChartProps {
  strokeWidth?: number;
  showDots?: boolean;
  curved?: boolean;
  fill?: boolean;
}

export interface BarChartProps extends ChartProps {
  barWidth?: number;
  horizontal?: boolean;
  stacked?: boolean;
}

export interface PieChartProps {
  width?: number;
  height?: number;
  data: { label: string; value: number; color?: string }[];
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
}

// Utility functions
const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
];

function normalizeData(data: DataPoint[] | ChartSeries[]): ChartSeries[] {
  if (data.length === 0) return [];
  if ('name' in data[0]) return data as ChartSeries[];
  return [{ name: 'Series 1', data: data as DataPoint[] }];
}

function getMinMax(series: ChartSeries[]): { minY: number; maxY: number } {
  let minY = Infinity;
  let maxY = -Infinity;

  series.forEach(s => {
    s.data.forEach(d => {
      minY = Math.min(minY, d.y);
      maxY = Math.max(maxY, d.y);
    });
  });

  // No data at all.
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
    return { minY: 0, maxY: 1 };
  }

  // Headroom is added as a fraction of the span, not by multiplying the maximum.
  // `maxY * 1.1` pushed the axis top *below* the highest value whenever that value
  // was negative, so those points scaled outside the plot area.
  const span = maxY - minY;

  // A flat series has zero span, which made every scaled value NaN (0/0).
  if (span === 0) {
    const magnitude = Math.abs(maxY) || 1;
    return { minY: Math.min(0, maxY - magnitude * 0.1), maxY: maxY + magnitude * 0.1 };
  }

  return { minY: Math.min(0, minY), maxY: maxY + span * 0.1 };
}

function createLinePath(points: { x: number; y: number }[], curved: boolean): string {
  if (points.length === 0) return '';
  
  if (!curved) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }
  
  // Smooth curve using bezier
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

// LineChart Component
export function LineChart({
  width = 400,
  height = 300,
  data,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLabels = true,
  showDots = true,
  strokeWidth = 2,
  curved = true,
  fill = false,
  animated = true,
  className,
  style,
}: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const series = useMemo(() => normalizeData(data), [data]);
  const { minY, maxY } = useMemo(() => getMinMax(series), [series]);
  
  // Labels come from whichever series has the most points, and that same length
  // drives x positioning for every series.
  const xLabels = useMemo(() => {
    if (series.length === 0) return [];
    const longest = series.reduce(
      (best, s) => (s.data.length > best.data.length ? s : best),
      series[0]
    );
    return longest.data.map(d => String(d.x));
  }, [series]);

  const xAxisLength = xLabels.length;
  
  const scaleY = (value: number) => {
    return chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
  };
  
  // A single point makes `index / (total - 1)` a 0/0 NaN; centre it instead.
  const scaleX = (index: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    return (index / (total - 1)) * chartWidth;
  };

  return (
    <svg width={width} height={height} className={className} style={style}>
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid */}
        {showGrid && (
          <g className="grid" stroke="#e5e7eb" strokeWidth="1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                strokeDasharray="4,4"
              />
            ))}
          </g>
        )}
        
        {/* Y-axis labels */}
        {showLabels && (
          <g className="y-labels" fontSize="12" fill="#6b7280">
            {[0, 0.5, 1].map((ratio, i) => {
              const value = maxY - (maxY - minY) * ratio;
              return (
                <text key={i} x={-10} y={chartHeight * ratio + 4} textAnchor="end">
                  {Math.round(value)}
                </text>
              );
            })}
          </g>
        )}
        
        {/* X-axis labels */}
        {showLabels && (
          <g className="x-labels" fontSize="12" fill="#6b7280">
            {xLabels.map((label, i) => (
              <text
                key={i}
                x={scaleX(i, xLabels.length)}
                y={chartHeight + 25}
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </g>
        )}
        
        {/* Lines */}
        {series.map((s, seriesIndex) => {
          // All series share one x axis, taken from the longest one. Using each
          // series' own length stretched every series across the full width
          // independently, so series of differing lengths no longer lined up with
          // each other or with the axis labels.
          const points = s.data.map((d, i) => ({
            x: scaleX(i, xAxisLength),
            y: scaleY(d.y),
          }));

          const linePath = createLinePath(points, curved);
          const color = s.color || colors[seriesIndex % colors.length];

          // An empty series used to throw here reading `points[points.length - 1].x`.
          if (points.length === 0) return null;

          return (
            <g key={seriesIndex}>
              {fill && (
                <path
                  d={`${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`}
                  fill={color}
                  fillOpacity={0.1}
                />
              )}
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={animated ? 100 : undefined}
                style={animated ? {
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: 'input-kit-chart-dash 1s ease-out forwards',
                } : undefined}
              />
              {showDots && points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill="white"
                  stroke={color}
                  strokeWidth={2}
                />
              ))}
            </g>
          );
        })}
      </g>
      
      {animated && (
        <style>{`
          @keyframes input-kit-chart-dash {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}
    </svg>
  );
}

// BarChart Component
export function BarChart({
  width = 400,
  height = 300,
  data,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLabels = true,
  barWidth = 30,
  animated = true,
  className,
  style,
}: BarChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const series = useMemo(() => normalizeData(data), [data]);
  const { minY, maxY } = useMemo(() => getMinMax(series), [series]);
  
  const firstSeries = series[0]?.data || [];
  
  const scaleY = (value: number) => {
    return chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
  };

  return (
    <svg width={width} height={height} className={className} style={style}>
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid */}
        {showGrid && (
          <g className="grid" stroke="#e5e7eb" strokeWidth="1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                strokeDasharray="4,4"
              />
            ))}
          </g>
        )}
        
        {/* Bars */}
        {firstSeries.map((d, i) => {
          const barX = (chartWidth / firstSeries.length) * i + (chartWidth / firstSeries.length - barWidth) / 2;
          const barHeight = chartHeight - scaleY(d.y);
          const color = colors[i % colors.length];
          
          return (
            <g key={i}>
              <rect
                x={barX}
                y={animated ? chartHeight : scaleY(d.y)}
                width={barWidth}
                height={animated ? 0 : barHeight}
                fill={color}
                rx={4}
                style={animated ? {
                  animation: `grow-bar-${i} 0.5s ease-out ${i * 0.1}s forwards`,
                } : undefined}
              />
              {showLabels && (
                <text
                  x={barX + barWidth / 2}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {String(d.x)}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Y-axis labels */}
        {showLabels && (
          <g className="y-labels" fontSize="12" fill="#6b7280">
            {[0, 0.5, 1].map((ratio, i) => {
              const value = maxY - (maxY - minY) * ratio;
              return (
                <text key={i} x={-10} y={chartHeight * ratio + 4} textAnchor="end">
                  {Math.round(value)}
                </text>
              );
            })}
          </g>
        )}
      </g>
      
      {animated && (
        <style>{`
          ${firstSeries.map((d, i) => `
            @keyframes grow-bar-${i} {
              to {
                y: ${scaleY(d.y) + padding.top}px;
                height: ${chartHeight - scaleY(d.y)}px;
              }
            }
          `).join('')}
        `}</style>
      )}
    </svg>
  );
}

// PieChart Component
export function PieChart({
  width = 300,
  height = 300,
  data,
  innerRadius = 0,
  showLabels = true,
  showLegend = false,
  colors = DEFAULT_COLORS,
  className,
  style,
}: PieChartProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  
  const slices = useMemo(() => {
    let startAngle = -Math.PI / 2;
    
    return data.map((d, i) => {
      const angle = (d.value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      
      const slice = {
        ...d,
        startAngle,
        endAngle,
        midAngle,
        color: d.color || colors[i % colors.length],
        percentage: ((d.value / total) * 100).toFixed(1),
      };
      
      startAngle = endAngle;
      return slice;
    });
  }, [data, total, colors]);
  
  const createArc = (startAngle: number, endAngle: number, r: number, ir: number) => {
    const x1 = centerX + r * Math.cos(startAngle);
    const y1 = centerY + r * Math.sin(startAngle);
    const x2 = centerX + r * Math.cos(endAngle);
    const y2 = centerY + r * Math.sin(endAngle);
    
    const x3 = centerX + ir * Math.cos(endAngle);
    const y3 = centerY + ir * Math.sin(endAngle);
    const x4 = centerX + ir * Math.cos(startAngle);
    const y4 = centerY + ir * Math.sin(startAngle);
    
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    
    if (ir === 0) {
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }
    
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <svg width={width} height={height} className={className} style={style}>
      {slices.map((slice, i) => (
        <g key={i}>
          <path
            d={createArc(slice.startAngle, slice.endAngle, radius, innerRadius)}
            fill={slice.color}
            stroke="white"
            strokeWidth={2}
          />
          {showLabels && (
            <text
              x={centerX + (radius + innerRadius) / 2 * 0.7 * Math.cos(slice.midAngle)}
              y={centerY + (radius + innerRadius) / 2 * 0.7 * Math.sin(slice.midAngle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="white"
              fontWeight="bold"
            >
              {slice.percentage}%
            </text>
          )}
        </g>
      ))}
      
      {showLegend && (
        <g transform={`translate(${width - 100}, 20)`}>
          {slices.map((slice, i) => (
            <g key={i} transform={`translate(0, ${i * 20})`}>
              <rect width={12} height={12} fill={slice.color} rx={2} />
              <text x={18} y={10} fontSize="12" fill="#374151">
                {slice.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

// Hook for chart data manipulation
export function useChart<T extends DataPoint>(initialData: T[] = []) {
  const [data, setData] = React.useState<T[]>(initialData);
  
  const addPoint = React.useCallback((point: T) => {
    setData(prev => [...prev, point]);
  }, []);
  
  const removePoint = React.useCallback((index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const updatePoint = React.useCallback((index: number, point: Partial<T>) => {
    setData(prev => prev.map((p, i) => i === index ? { ...p, ...point } : p));
  }, []);
  
  const clear = React.useCallback(() => {
    setData([]);
  }, []);
  
  return { data, setData, addPoint, removePoint, updatePoint, clear };
}

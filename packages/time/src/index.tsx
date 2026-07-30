// @input-kit/time - Relative time formatting utilities and components

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TimeFormatOptions {
  /** Locale for formatting (default: 'en') */
  locale?: string | readonly string[];
  /** Style: 'long' = "2 hours ago", 'short' = "2h ago", 'narrow' = "2h" */
  style?: 'long' | 'short' | 'narrow';
  /** Whether to include "ago" / "in" suffix/prefix */
  addSuffix?: boolean;
  /** Maximum unit to use (e.g., 'day' won't show weeks/months/years) */
  maxUnit?: TimeUnit;
  /** Minimum unit to use (e.g., 'minute' won't show seconds) */
  minUnit?: TimeUnit;
  /** Round to nearest unit instead of floor */
  round?: boolean;
  /** Custom "now" threshold in seconds (times within this show "just now") */
  nowThreshold?: number;
}

export interface UseRelativeTimeOptions extends TimeFormatOptions {
  /** Update interval in milliseconds (default: 60000 = 1 minute) */
  updateInterval?: number;
  /** Whether to auto-update (default: true) */
  autoUpdate?: boolean;
}

export interface UseRelativeTimeReturn {
  /** Formatted relative time string */
  relative: string;
  /** Difference in milliseconds */
  diff: number;
  /** Whether the date is in the past */
  isPast: boolean;
  /** Whether the date is in the future */
  isFuture: boolean;
  /** The primary unit being displayed */
  unit: TimeUnit | 'now';
  /** The numeric value of the primary unit */
  value: number;
  /** Force refresh the time */
  refresh: () => void;
}

export interface RelativeTimeProps extends Omit<TimeFormatOptions, 'style'> {
  /** The date to format */
  date: Date | number | string;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Whether to auto-update */
  autoUpdate?: boolean;
  /** Custom render function */
  children?: (result: UseRelativeTimeReturn) => React.ReactNode;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  cssStyle?: React.CSSProperties;
  /** Format style: 'long' = "2 hours ago", 'short' = "2h ago", 'narrow' = "2h" */
  formatStyle?: 'long' | 'short' | 'narrow';
}

export interface TimeAgoProps extends Omit<RelativeTimeProps, 'addSuffix'> {}

export interface TimeUntilProps extends Omit<RelativeTimeProps, 'addSuffix'> {}

interface TimeUnitConfig {
  unit: TimeUnit;
  seconds: number;
  long: { singular: string; plural: string };
  short: string;
  narrow: string;
}

// ============================================================================
// Constants
// ============================================================================

const TIME_UNITS: TimeUnitConfig[] = [
  { unit: 'year', seconds: 31536000, long: { singular: 'year', plural: 'years' }, short: 'yr', narrow: 'y' },
  { unit: 'month', seconds: 2592000, long: { singular: 'month', plural: 'months' }, short: 'mo', narrow: 'mo' },
  { unit: 'week', seconds: 604800, long: { singular: 'week', plural: 'weeks' }, short: 'wk', narrow: 'w' },
  { unit: 'day', seconds: 86400, long: { singular: 'day', plural: 'days' }, short: 'd', narrow: 'd' },
  { unit: 'hour', seconds: 3600, long: { singular: 'hour', plural: 'hours' }, short: 'hr', narrow: 'h' },
  { unit: 'minute', seconds: 60, long: { singular: 'minute', plural: 'minutes' }, short: 'min', narrow: 'm' },
  { unit: 'second', seconds: 1, long: { singular: 'second', plural: 'seconds' }, short: 'sec', narrow: 's' },
];

const UNIT_ORDER: TimeUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

const UNIT_DISPLAY_MAP: Record<NonNullable<TimeFormatOptions['style']>, 'long' | 'short' | 'narrow'> = {
  long: 'long',
  short: 'short',
  narrow: 'narrow',
};

function getRelativeTimeFormatter(
  locale: TimeFormatOptions['locale'],
  style: NonNullable<TimeFormatOptions['style']>
) {
  if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat === 'undefined') {
    return undefined;
  }

  try {
    return new Intl.RelativeTimeFormat(locale, {
      style,
      numeric: 'auto',
    });
  } catch {
    return undefined;
  }
}

function getUnitFormatter(
  locale: TimeFormatOptions['locale'],
  style: NonNullable<TimeFormatOptions['style']>,
  unit: TimeUnit
) {
  if (typeof Intl === 'undefined' || typeof Intl.NumberFormat === 'undefined') {
    return undefined;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: UNIT_DISPLAY_MAP[style],
    });
  } catch {
    return undefined;
  }
}

function formatRelativeFallback(
  value: number,
  config: TimeUnitConfig,
  style: NonNullable<TimeFormatOptions['style']>,
  addSuffix: boolean,
  isPast: boolean
) {
  let unitStr: string;
  if (style === 'long') {
    unitStr = value === 1 ? config.long.singular : config.long.plural;
  } else if (style === 'short') {
    unitStr = config.short;
  } else {
    unitStr = config.narrow;
  }

  const timeStr = style === 'narrow'
    ? `${value}${unitStr}`
    : `${value} ${unitStr}`;

  if (!addSuffix) {
    return timeStr;
  }

  return isPast ? `${timeStr} ago` : `in ${timeStr}`;
}

function getRelativeDayLabel(offset: -1 | 0 | 1, locale: TimeFormatOptions['locale']) {
  const formatter = getRelativeTimeFormatter(locale, 'long');
  if (formatter) {
    return formatter.format(offset, 'day');
  }

  if (offset === -1) return 'yesterday';
  if (offset === 1) return 'tomorrow';
  return 'today';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a date input into a Date object
 */
export function parseDate(date: Date | number | string): Date {
  if (date instanceof Date) return date;
  if (typeof date === 'number') return new Date(date);
  return new Date(date);
}

/**
 * Get the difference between two dates in seconds
 */
export function getTimeDiff(date: Date | number | string, baseDate: Date = new Date()): number {
  const targetDate = parseDate(date);
  return Math.floor((targetDate.getTime() - baseDate.getTime()) / 1000);
}

/**
 * Get the appropriate time unit for a given number of seconds
 */
export function getTimeUnit(
  seconds: number,
  options: Pick<TimeFormatOptions, 'maxUnit' | 'minUnit'> = {}
): { unit: TimeUnit; value: number; config: TimeUnitConfig } {
  const absSeconds = Math.abs(seconds);
  const { maxUnit, minUnit } = options;

  const maxIndex = maxUnit ? UNIT_ORDER.indexOf(maxUnit) : UNIT_ORDER.length - 1;
  const minIndex = minUnit ? UNIT_ORDER.indexOf(minUnit) : 0;

  // Filter units based on max/min constraints
  const availableUnits = TIME_UNITS.filter((u) => {
    const unitIndex = UNIT_ORDER.indexOf(u.unit);
    return unitIndex >= minIndex && unitIndex <= maxIndex;
  });

  for (const config of availableUnits) {
    if (absSeconds >= config.seconds) {
      return {
        unit: config.unit,
        value: Math.floor(absSeconds / config.seconds),
        config,
      };
    }
  }

  // Nothing was large enough. Fall back to the smallest permitted unit, but never
  // report zero of it — `minUnit: 'minute'` on a 30-second-old date used to floor to
  // "0 minutes ago".
  const smallestUnit = availableUnits[availableUnits.length - 1] || TIME_UNITS[TIME_UNITS.length - 1];
  return {
    unit: smallestUnit.unit,
    value: Math.max(1, Math.floor(absSeconds / smallestUnit.seconds)),
    config: smallestUnit,
  };
}

/**
 * Format a relative time string
 */
export function formatRelativeTime(
  date: Date | number | string,
  options: TimeFormatOptions = {}
): string {
  const {
    locale = 'en',
    style = 'long',
    addSuffix = true,
    maxUnit,
    minUnit,
    round = false,
    nowThreshold = 10,
  } = options;

  const diffSeconds = getTimeDiff(date);
  const absDiff = Math.abs(diffSeconds);
  const isPast = diffSeconds < 0;

  // Handle "just now" threshold
  if (absDiff < nowThreshold) {
    const formatter = getRelativeTimeFormatter(locale, style);
    if (formatter && addSuffix) {
      return formatter.format(0, 'second');
    }
    return style === 'narrow' ? 'now' : 'just now';
  }

  let { unit, value, config } = getTimeUnit(absDiff, { maxUnit, minUnit });
  let displayValue = round ? Math.round(absDiff / config.seconds) : value;

  // Rounding can overflow the unit that flooring picked: 3,599 seconds selects
  // `minute` and rounds to 60, which used to print "60 minutes ago" instead of
  // promoting to "1 hour ago". Re-derive the unit from the rounded total.
  if (round) {
    const roundedSeconds = displayValue * config.seconds;
    const promoted = getTimeUnit(roundedSeconds, { maxUnit, minUnit });

    if (promoted.config.seconds > config.seconds) {
      unit = promoted.unit;
      config = promoted.config;
      displayValue = Math.round(roundedSeconds / config.seconds);
    }
  }

  if (addSuffix) {
    const formatter = getRelativeTimeFormatter(locale, style);
    if (formatter) {
      return formatter.format(isPast ? -displayValue : displayValue, unit);
    }
  }

  if (!addSuffix) {
    const formatter = getUnitFormatter(locale, style, unit);
    if (formatter) {
      return formatter.format(displayValue);
    }
  }

  return formatRelativeFallback(displayValue, config, style, addSuffix, isPast);
}

/**
 * Format a duration in seconds to a human-readable string
 */
export function formatDuration(
  seconds: number,
  options: Pick<TimeFormatOptions, 'style' | 'maxUnit' | 'minUnit' | 'locale'> = {}
): string {
  const { locale = 'en', style = 'long', maxUnit, minUnit } = options;
  
  if (seconds === 0) return style === 'long' ? '0 seconds' : style === 'short' ? '0 sec' : '0s';

  const parts: string[] = [];
  let remaining = Math.abs(seconds);

  const maxIndex = maxUnit ? UNIT_ORDER.indexOf(maxUnit) : UNIT_ORDER.length - 1;
  const minIndex = minUnit ? UNIT_ORDER.indexOf(minUnit) : 0;

  for (const config of TIME_UNITS) {
    const unitIndex = UNIT_ORDER.indexOf(config.unit);
    if (unitIndex < minIndex || unitIndex > maxIndex) continue;

    if (remaining >= config.seconds) {
      const value = Math.floor(remaining / config.seconds);
      remaining = remaining % config.seconds;

      let unitStr: string;
      const formatter = getUnitFormatter(locale, style, config.unit);
      if (formatter) {
        parts.push(formatter.format(value));
      } else if (style === 'long') {
        unitStr = value === 1 ? config.long.singular : config.long.plural;
        parts.push(`${value} ${unitStr}`);
      } else if (style === 'short') {
        parts.push(`${value} ${config.short}`);
      } else {
        parts.push(`${value}${config.narrow}`);
      }
    }
  }

  if (parts.length === 0) {
    const smallestUnit = TIME_UNITS.find(u => UNIT_ORDER.indexOf(u.unit) >= minIndex) || TIME_UNITS[TIME_UNITS.length - 1];
    if (style === 'long') {
      return `0 ${smallestUnit.long.plural}`;
    } else if (style === 'short') {
      return `0 ${smallestUnit.short}`;
    } else {
      return `0${smallestUnit.narrow}`;
    }
  }

  if (style === 'narrow' || parts.length === 1) {
    return parts.join(' ');
  }

  // Joining is delegated to Intl.ListFormat so the conjunction matches the locale the
  // parts were formatted in. Hardcoded ' and ' / ', and ' produced strings like
  // "2 heures and 30 minutes" for locale 'fr'.
  try {
    return new Intl.ListFormat(
      typeof locale === 'string' ? locale : Array.from(locale),
      { style: style === 'short' ? 'short' : 'long', type: 'conjunction' }
    ).format(parts);
  } catch {
    if (parts.length === 2) return parts.join(' and ');
    return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
  }
}

/**
 * Get a smart update interval based on the time difference
 */
export function getSmartInterval(diffSeconds: number): number {
  const absDiff = Math.abs(diffSeconds);
  
  if (absDiff < 60) return 1000; // Update every second for < 1 minute
  if (absDiff < 3600) return 30000; // Update every 30 seconds for < 1 hour
  if (absDiff < 86400) return 60000; // Update every minute for < 1 day
  return 3600000; // Update every hour for >= 1 day
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | number | string): boolean {
  const d = parseDate(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date | number | string): boolean {
  const d = parseDate(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | number | string): boolean {
  const d = parseDate(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Format a date with relative context (Today, Yesterday, etc.)
 */
export function formatWithContext(
  date: Date | number | string,
  options: TimeFormatOptions & { dateFormat?: Intl.DateTimeFormatOptions } = {}
): string {
  const d = parseDate(date);
  const { dateFormat = { month: 'short', day: 'numeric' }, locale = 'en' } = options;
  const timeText = d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });

  if (isToday(d)) {
    return `${getRelativeDayLabel(0, locale)}, ${timeText}`;
  }
  if (isYesterday(d)) {
    return `${getRelativeDayLabel(-1, locale)}, ${timeText}`;
  }
  if (isTomorrow(d)) {
    return `${getRelativeDayLabel(1, locale)}, ${timeText}`;
  }

  const diffDays = Math.abs(getTimeDiff(d)) / 86400;
  
  if (diffDays < 7) {
    return formatRelativeTime(d, options);
  }

  return d.toLocaleDateString(locale, dateFormat);
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for relative time formatting with auto-updates
 */
export function useRelativeTime(
  date: Date | number | string,
  options: UseRelativeTimeOptions = {}
): UseRelativeTimeReturn {
  const {
    updateInterval,
    autoUpdate = true,
    nowThreshold = 10,
    ...formatOptions
  } = options;

  const [now, setNow] = useState(() => new Date());

  const refresh = useCallback(() => {
    setNow(new Date());
  }, []);

  const result = useMemo(() => {
    const diffSeconds = getTimeDiff(date, now);
    const absDiff = Math.abs(diffSeconds);
    const isPast = diffSeconds < 0;
    const isFuture = diffSeconds > 0;

    if (absDiff < nowThreshold) {
      return {
        relative: 'just now',
        diff: diffSeconds * 1000,
        isPast,
        isFuture,
        unit: 'now' as const,
        value: 0,
        refresh,
      };
    }

    const { unit, value } = getTimeUnit(absDiff, formatOptions);
    const relative = formatRelativeTime(date, { ...formatOptions, nowThreshold });

    return {
      relative,
      diff: diffSeconds * 1000,
      isPast,
      isFuture,
      unit,
      value,
      refresh,
    };
  }, [date, now, nowThreshold, formatOptions, refresh]);

  useEffect(() => {
    if (!autoUpdate) return;

    const interval = updateInterval ?? getSmartInterval(result.diff / 1000);
    const timer = setTimeout(() => {
      setNow(new Date());
    }, interval);

    return () => clearTimeout(timer);
  }, [autoUpdate, updateInterval, result.diff]);

  return result;
}

/**
 * Hook for countdown timer
 */
export function useCountdown(
  targetDate: Date | number | string,
  options: {
    onComplete?: () => void;
    interval?: number;
  } = {}
): {
  timeLeft: number;
  isComplete: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const { onComplete, interval = 1000 } = options;
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = getTimeDiff(targetDate);
    return Math.max(0, diff * 1000);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = getTimeDiff(targetDate);
      const newTimeLeft = Math.max(0, diff * 1000);
      
      setTimeLeft((prev) => {
        if (prev > 0 && newTimeLeft === 0 && onComplete) {
          onComplete();
        }
        return newTimeLeft;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [targetDate, interval, onComplete]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return {
    timeLeft,
    isComplete: timeLeft === 0,
    days,
    hours,
    minutes,
    seconds,
    formatted: parts.join(' '),
  };
}

/**
 * Hook for stopwatch functionality
 */
export function useStopwatch(options: { autoStart?: boolean } = {}): {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  formatted: string;
} {
  const { autoStart = false } = options;
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Elapsed time is measured against a wall-clock origin rather than accumulated a
  // tick at a time. Adding a literal 100 per interval drifted steadily behind real
  // time — badly so in a background tab, where timers are throttled to once a second
  // or less but each tick still only advanced the readout by 100ms.
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    startedAtRef.current = Date.now();

    const timer = setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      setTime(accumulatedRef.current + (Date.now() - startedAt));
    }, 100);

    return () => {
      clearInterval(timer);
      const startedAt = startedAtRef.current;
      if (startedAt !== null) {
        accumulatedRef.current += Date.now() - startedAt;
        startedAtRef.current = null;
      }
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    accumulatedRef.current = 0;
    startedAtRef.current = null;
    setTime(0);
    setIsRunning(false);
  }, []);

  const totalSeconds = Math.floor(time / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((time % 1000) / 10);

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

  return { time, isRunning, start, stop, reset, formatted };
}

// ============================================================================
// Components
// ============================================================================

/**
 * Component for displaying relative time with auto-updates
 */
export function RelativeTime({
  date,
  updateInterval,
  autoUpdate = true,
  children,
  className,
  cssStyle,
  formatStyle,
  ...formatOptions
}: RelativeTimeProps): JSX.Element {
  const result = useRelativeTime(date, {
    updateInterval,
    autoUpdate,
    style: formatStyle,
    ...formatOptions,
  });

  if (children) {
    return <>{children(result)}</>;
  }

  const parsedDate = parseDate(date);

  return (
    <time
      dateTime={parsedDate.toISOString()}
      title={parsedDate.toLocaleString(formatOptions.locale)}
      className={className}
      style={cssStyle}
    >
      {result.relative}
    </time>
  );
}

/**
 * Convenience component for "time ago" display
 */
export function TimeAgo(props: TimeAgoProps): JSX.Element {
  return <RelativeTime {...props} addSuffix />;
}

/**
 * Convenience component for "time until" display
 */
export function TimeUntil(props: TimeUntilProps): JSX.Element {
  return <RelativeTime {...props} addSuffix />;
}

/**
 * Countdown timer component
 */
export function Countdown({
  targetDate,
  onComplete,
  format = 'full',
  className,
  style,
}: {
  targetDate: Date | number | string;
  onComplete?: () => void;
  format?: 'full' | 'compact' | 'minimal';
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element {
  const { days, hours, minutes, seconds, isComplete, formatted } = useCountdown(targetDate, {
    onComplete,
  });

  const renderContent = () => {
    if (isComplete) return '0:00';

    switch (format) {
      case 'minimal':
        return formatted;
      case 'compact':
        return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      case 'full':
      default:
        const parts: string[] = [];
        if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
        parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
        return parts.join(', ');
    }
  };

  return (
    <span className={className} style={style}>
      {renderContent()}
    </span>
  );
}

/**
 * Stopwatch component
 */
export function Stopwatch({
  autoStart = false,
  className,
  style,
  children,
}: {
  autoStart?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: (props: ReturnType<typeof useStopwatch>) => React.ReactNode;
}): JSX.Element {
  const stopwatch = useStopwatch({ autoStart });

  if (children) {
    return <>{children(stopwatch)}</>;
  }

  return (
    <span className={className} style={style}>
      {stopwatch.formatted}
    </span>
  );
}

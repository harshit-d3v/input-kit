// @input-kit/date - Date picker component

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';

// Types
export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  placeholder?: string;
  format?: string;
  locale?: string;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
  showTodayButton?: boolean;
  showClearButton?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (start: Date | null, end: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface UseDatePickerOptions {
  initialDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  onChange?: (date: Date | null) => void;
}

export interface UseDatePickerReturn {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  visibleMonth: Date;
  setVisibleMonth: (date: Date) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  isDateDisabled: (date: Date) => boolean;
  isDateInRange: (date: Date) => boolean;
}

// Utility functions
export function formatDate(date: Date, format: string = 'MM/DD/YYYY', locale: string = 'en-US'): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const shortYear = year.slice(-2);
  
  const monthNames = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
  
  return format
    .replace('YYYY', year)
    .replace('YY', shortYear)
    .replace('MMMM', monthNames)
    .replace('MMM', monthShort)
    .replace('MM', month)
    .replace('DD', day);
}

export function parseDate(dateString: string, format: string = 'MM/DD/YYYY'): Date | null {
  try {
    const formatParts = format.match(/(YYYY|YY|MM|DD)/g) || [];
    const dateParts = dateString.match(/\d+/g) || [];
    
    if (formatParts.length !== dateParts.length) return null;
    
    let year = new Date().getFullYear();
    let month = 0;
    let day = 1;
    
    formatParts.forEach((part, i) => {
      const value = parseInt(dateParts[i], 10);
      switch (part) {
        case 'YYYY':
          year = value;
          break;
        case 'YY':
          year = 2000 + value;
          break;
        case 'MM':
          month = value - 1;
          break;
        case 'DD':
          day = value;
          break;
      }
    });
    
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Hook
export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  const {
    initialDate = null,
    minDate,
    maxDate,
    disabledDates = [],
    onChange,
  } = options;

  const [selectedDate, setSelectedDateState] = useState<Date | null>(initialDate);
  const [visibleMonth, setVisibleMonth] = useState<Date>(initialDate || new Date());
  const [isOpen, setIsOpen] = useState(false);

  const setSelectedDate = useCallback((date: Date | null) => {
    setSelectedDateState(date);
    onChange?.(date);
  }, [onChange]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const goToPreviousMonth = useCallback(() => {
    setVisibleMonth(prev => addMonths(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setVisibleMonth(prev => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setVisibleMonth(today);
    setSelectedDate(today);
  }, [setSelectedDate]);

  const isDateDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(d => isSameDay(d, date));
  }, [minDate, maxDate, disabledDates]);

  const isDateInRange = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  }, [minDate, maxDate]);

  return {
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    isOpen,
    open,
    close,
    toggle,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    isDateDisabled,
    isDateInRange,
  };
}

// Calendar Component
export function Calendar({
  value,
  onChange,
  month: controlledMonth,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates = [],
  weekStartsOn = 0,
  locale = 'en-US',
  className,
  style,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState(value || new Date());
  const month = controlledMonth || internalMonth;
  
  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const weekDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(2024, 0, weekStartsOn === 1 ? 1 : 7); // A known Monday or Sunday
    for (let i = 0; i < 7; i++) {
      days.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(addDays(baseDate, i)));
    }
    return days;
  }, [locale, weekStartsOn]);

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDay = getFirstDayOfMonth(month);
    const daysInMonth = getDaysInMonth(month);
    const startOffset = (firstDay - weekStartsOn + 7) % 7;
    
    // Previous month days
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), i));
    }
    
    return days;
  }, [month, weekStartsOn]);

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(d => isSameDay(d, date));
  };

  const monthYearLabel = new Intl.DateTimeFormat(locale, { 
    month: 'long', 
    year: 'numeric' 
  }).format(month);

  return (
    <div
      className={className}
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '280px',
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => handleMonthChange(addMonths(month, -1))}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '18px',
          }}
        >
          ‹
        </button>
        <span style={{ fontWeight: 600 }}>{monthYearLabel}</span>
        <button
          onClick={() => handleMonthChange(addMonths(month, 1))}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '18px',
          }}
        >
          ›
        </button>
      </div>
      
      {/* Week days header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {weekDays.map((day, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              padding: '4px',
            }}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={i} />;
          }
          
          const isSelected = value && isSameDay(date, value);
          const isTodayDate = isToday(date);
          const disabled = isDateDisabled(date);
          
          return (
            <button
              key={i}
              onClick={() => !disabled && onChange?.(date)}
              disabled={disabled}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: '50%',
                background: isSelected ? '#3b82f6' : 'transparent',
                color: isSelected ? 'white' : disabled ? '#d1d5db' : '#111827',
                fontWeight: isTodayDate ? 700 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                outline: isTodayDate && !isSelected ? '2px solid #3b82f6' : 'none',
                outlineOffset: '-2px',
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// DatePicker Component
export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  placeholder = 'Select date',
  format = 'MM/DD/YYYY',
  locale = 'en-US',
  weekStartsOn = 0,
  showTodayButton = true,
  showClearButton = true,
  disabled = false,
  className,
  style,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value ? formatDate(value, format, locale) : '');
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(value || new Date());

  // Sync input value with controlled value
  useEffect(() => {
    setInputValue(value ? formatDate(value, format, locale) : '');
  }, [value, format, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsed = parseDate(newValue, format);
    if (parsed) {
      onChange?.(parsed);
      setVisibleMonth(parsed);
    }
  };

  const handleDateSelect = (date: Date) => {
    onChange?.(date);
    setInputValue(formatDate(date, format, locale));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange?.(null);
    setInputValue('');
  };

  const handleToday = () => {
    const today = new Date();
    onChange?.(today);
    setInputValue(formatDate(today, format, locale));
    setVisibleMonth(today);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => !disabled && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          width: '150px',
          outline: 'none',
        }}
      />
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            zIndex: 1000,
          }}
        >
          <Calendar
            value={value}
            onChange={handleDateSelect}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            weekStartsOn={weekStartsOn}
            locale={locale}
          />
          
          {(showTodayButton || showClearButton) && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '8px 16px',
                background: 'white',
                borderTop: '1px solid #e5e7eb',
                borderRadius: '0 0 8px 8px',
              }}
            >
              {showTodayButton && (
                <button
                  onClick={handleToday}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Today
                </button>
              )}
              {showClearButton && (
                <button
                  onClick={handleClear}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

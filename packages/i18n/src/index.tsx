// @input-kit/i18n - Internationalization library

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';

// Types
export type TranslationValue = string | { [key: string]: TranslationValue };
export type Translations = Record<string, TranslationValue>;
export type LocaleMessages = Record<string, Translations>;

export interface I18nConfig {
  locale: string;
  fallbackLocale?: string;
  messages: LocaleMessages;
  onMissingKey?: (key: string, locale: string) => string;
}

export interface I18nContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  t: TranslateFunction;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  isRTL: boolean;
  availableLocales: string[];
}

export type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

export interface I18nProviderProps {
  config: I18nConfig;
  children: ReactNode;
}

export interface TransProps {
  i18nKey: string;
  params?: Record<string, string | number>;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'sd'];

// Utility functions
function getNestedValue(obj: TranslationValue | undefined, path: string): string | undefined {
  const keys = path.split('.');
  let result: TranslationValue | undefined = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) return undefined;
    if (typeof result === 'string') return undefined;
    result = result[key];
  }
  
  return typeof result === 'string' ? result : undefined;
}

function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{\{?\s*(\w+)\s*\}?\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

function pluralize(
  template: string,
  count: number,
  locale: string
): string {
  // Simple pluralization: template can have format "one | other" or "zero | one | other"
  const parts = template.split('|').map(s => s.trim());
  
  if (parts.length === 1) return parts[0];
  
  // Use Intl.PluralRules for proper pluralization
  const pluralRules = new Intl.PluralRules(locale);
  const rule = pluralRules.select(count);
  
  if (parts.length === 2) {
    // "one | other" format
    return count === 1 ? parts[0] : parts[1];
  }
  
  if (parts.length === 3) {
    // "zero | one | other" format
    if (count === 0) return parts[0];
    if (count === 1) return parts[1];
    return parts[2];
  }
  
  // More complex pluralization based on locale rules
  const ruleIndex = ['zero', 'one', 'two', 'few', 'many', 'other'].indexOf(rule);
  return parts[Math.min(ruleIndex, parts.length - 1)] || parts[parts.length - 1];
}

// Context
const I18nContext = createContext<I18nContextValue | null>(null);

// Provider
export function I18nProvider({ config, children }: I18nProviderProps) {
  const { messages, fallbackLocale, onMissingKey } = config;
  const [locale, setLocale] = useState(config.locale);

  useEffect(() => {
    setLocale(config.locale);
  }, [config.locale]);
  
  const availableLocales = useMemo(() => Object.keys(messages), [messages]);
  
  const isRTL = useMemo(() => {
    const lang = locale.split('-')[0];
    return RTL_LANGUAGES.includes(lang);
  }, [locale]);
  
  const t: TranslateFunction = useCallback((key, params = {}) => {
    // Try current locale
    let translation = getNestedValue(messages[locale], key);
    
    // Try fallback locale
    if (translation === undefined && fallbackLocale) {
      translation = getNestedValue(messages[fallbackLocale], key);
    }
    
    // Handle missing key
    if (translation === undefined) {
      if (onMissingKey) {
        return onMissingKey(key, locale);
      }
      return key;
    }
    
    // Handle pluralization
    if ('count' in params && typeof params.count === 'number') {
      translation = pluralize(translation, params.count, locale);
    }
    
    // Interpolate parameters
    return interpolate(translation, params);
  }, [locale, messages, fallbackLocale, onMissingKey]);
  
  const formatNumber = useCallback((
    value: number,
    options?: Intl.NumberFormatOptions
  ) => {
    return new Intl.NumberFormat(locale, options).format(value);
  }, [locale]);
  
  const formatDate = useCallback((
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ) => {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }, [locale]);
  
  const formatCurrency = useCallback((
    value: number,
    currency: string = 'USD'
  ) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  }, [locale]);
  
  const formatRelativeTime = useCallback((
    value: number,
    unit: Intl.RelativeTimeFormatUnit
  ) => {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
  }, [locale]);
  
  const contextValue = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t,
    formatNumber,
    formatDate,
    formatCurrency,
    formatRelativeTime,
    isRTL,
    availableLocales,
  }), [locale, t, formatNumber, formatDate, formatCurrency, formatRelativeTime, isRTL, availableLocales]);
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Hooks
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}

export function useLocale() {
  const { locale, setLocale, availableLocales, isRTL } = useI18n();
  return { locale, setLocale, availableLocales, isRTL };
}

export function useFormatters() {
  const { formatNumber, formatDate, formatCurrency, formatRelativeTime, locale } = useI18n();
  return { formatNumber, formatDate, formatCurrency, formatRelativeTime, locale };
}

// Components
export function Trans({
  i18nKey,
  params,
  tag: Tag = 'span',
  className,
  style,
}: TransProps) {
  const { t } = useI18n();
  
  return (
    <Tag className={className} style={style}>
      {t(i18nKey, params)}
    </Tag>
  );
}

export function LocaleSwitcher({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const { locale, setLocale, availableLocales } = useLocale();
  const displayNames = useMemo(() => {
    if (typeof Intl.DisplayNames === 'undefined') {
      return null;
    }

    return new Intl.DisplayNames(availableLocales, { type: 'language' });
  }, [availableLocales]);
  
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className={className}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        ...style,
      }}
    >
      {availableLocales.map((loc) => (
        <option key={loc} value={loc}>
          {displayNames?.of(loc) ?? loc}
        </option>
      ))}
    </select>
  );
}

// Utility for creating type-safe translation keys
export function createTranslations<T extends Translations>(translations: T): T {
  return translations;
}

// Utility for merging translation files
export function mergeMessages(...messageSets: LocaleMessages[]): LocaleMessages {
  const result: LocaleMessages = {};
  
  for (const messages of messageSets) {
    for (const [locale, translations] of Object.entries(messages)) {
      result[locale] = { ...result[locale], ...translations };
    }
  }
  
  return result;
}

// Helper to detect browser locale
export function detectBrowserLocale(
  supportedLocales: string[],
  fallback: string = 'en'
): string {
  if (typeof navigator === 'undefined') return fallback;
  
  const browserLocales = navigator.languages || [navigator.language];
  
  for (const browserLocale of browserLocales) {
    // Exact match
    if (supportedLocales.includes(browserLocale)) {
      return browserLocale;
    }
    
    // Language code match (e.g., 'en-US' matches 'en')
    const langCode = browserLocale.split('-')[0];
    if (supportedLocales.includes(langCode)) {
      return langCode;
    }
    
    // Find locale starting with language code
    const match = supportedLocales.find(loc => loc.startsWith(langCode));
    if (match) return match;
  }
  
  return fallback;
}

// Date/time formatting presets
export const dateFormats = {
  short: { dateStyle: 'short' } as Intl.DateTimeFormatOptions,
  medium: { dateStyle: 'medium' } as Intl.DateTimeFormatOptions,
  long: { dateStyle: 'long' } as Intl.DateTimeFormatOptions,
  full: { dateStyle: 'full' } as Intl.DateTimeFormatOptions,
  time: { timeStyle: 'short' } as Intl.DateTimeFormatOptions,
  datetime: { dateStyle: 'medium', timeStyle: 'short' } as Intl.DateTimeFormatOptions,
};

// Number formatting presets
export const numberFormats = {
  decimal: { style: 'decimal' } as Intl.NumberFormatOptions,
  percent: { style: 'percent' } as Intl.NumberFormatOptions,
  compact: { notation: 'compact' } as Intl.NumberFormatOptions,
  scientific: { notation: 'scientific' } as Intl.NumberFormatOptions,
};

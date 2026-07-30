import type { z } from 'zod';
import type { FieldError, FieldErrors, FieldValues, Path } from './types.js';

export function zodErrorToFieldErrors<T extends FieldValues>(
  error: z.ZodError<T>
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const issue of error.issues) {
    // Zod reports ['members', 1, 'name']; joining gives the dotted key errors are
    // stored under, which is why FieldErrors is keyed by Path rather than keyof T.
    const path = issue.path.join('.') as Path<T>;
    errors[path] = {
      message: issue.message,
      type: issue.code,
    };
  }

  return errors;
}

export function getNestedValue<T extends FieldValues>(
  obj: T,
  path: string
): unknown {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[key];
  }

  return value;
}

export function setNestedValue<T extends FieldValues>(
  obj: T,
  path: string,
  value: unknown
): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj as Record<string, unknown>;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

export function isFieldDirty<T extends FieldValues>(
  defaultValues: T,
  currentValues: T,
  name: Path<T>
): boolean {
  // Read through the path rather than indexing directly: a nested field would
  // otherwise compare undefined against undefined and always report itself clean.
  const defaultValue = getNestedValue(defaultValues, name as string);
  const currentValue = getNestedValue(currentValues, name as string);

  if (typeof defaultValue !== typeof currentValue) {
    return true;
  }

  if (typeof defaultValue === 'object' && defaultValue !== null) {
    return JSON.stringify(defaultValue) !== JSON.stringify(currentValue);
  }

  return defaultValue !== currentValue;
}

export function cloneObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(cloneObject) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = cloneObject(obj[key]);
    }
  }

  return cloned;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateField<T extends FieldValues>(
  schema: z.ZodType<T>,
  values: T,
  name: Path<T>
): FieldError | undefined {
  const result = schema.safeParse(values);

  if (result.success) {
    return undefined;
  }

  const issue = result.error.issues.find(
    (issue) => issue.path.join('.') === (name as string)
  );

  if (issue) {
    return {
      message: issue.message,
      type: issue.code,
    };
  }

  return undefined;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

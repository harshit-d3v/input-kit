import type { z } from 'zod';
import type { ChangeEvent, FocusEvent } from 'react';

export type FieldValues = Record<string, unknown>;

export type FieldError = {
  message: string;
  type: string;
};

export type FieldErrors<T extends FieldValues> = {
  [K in keyof T]?: FieldError;
};

export type FieldState = {
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
};

export type FormState<T extends FieldValues> = {
  errors: FieldErrors<T>;
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  isValid: boolean;
  isValidating: boolean;
  dirtyFields: Partial<Record<keyof T, boolean>>;
  touchedFields: Partial<Record<keyof T, boolean>>;
  submitCount: number;
};

export type UseFormOptions<T extends FieldValues> = {
  schema: z.ZodType<T>;
  defaultValues?: Partial<T>;
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'all';
  reValidateMode?: 'onSubmit' | 'onBlur' | 'onChange';
  shouldFocusError?: boolean;
};

export type RegisterOptions = {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: unknown) => boolean | string | Promise<boolean | string>;
};

export type RegisterResult = {
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  ref: (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => void;
};

export type UseFormReturn<T extends FieldValues> = {
  register: (name: keyof T, options?: RegisterOptions) => RegisterResult;
  handleSubmit: (
    onValid: (data: T) => void | Promise<void>,
    onInvalid?: (errors: FieldErrors<T>) => void | Promise<void>
  ) => (e?: React.FormEvent) => Promise<void>;
  watch: <K extends keyof T>(name?: K) => K extends keyof T ? T[K] : T;
  setValue: <K extends keyof T>(name: K, value: T[K], options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }) => void;
  getValues: <K extends keyof T>(name?: K) => K extends keyof T ? T[K] : T;
  setError: <K extends keyof T>(name: K, error: FieldError) => void;
  clearErrors: <K extends keyof T>(name?: K | K[]) => void;
  reset: (values?: Partial<T>) => void;
  trigger: <K extends keyof T>(name?: K | K[]) => Promise<boolean>;
  formState: FormState<T>;
  control: Control<T>;
};

export type Control<T extends FieldValues> = {
  _formState: FormState<T>;
  _fields: Map<keyof T, FieldState>;
  _values: T;
  _defaultValues: T;
  _schema: z.ZodType<T>;
  _options: UseFormOptions<T>;
  _subscribers: Set<() => void>;
  _updateFormState: (updates: Partial<FormState<T>>) => void;
  _setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  _setFieldDirty: <K extends keyof T>(name: K, isDirty: boolean) => void;
  _setFieldTouched: <K extends keyof T>(name: K, isTouched: boolean) => void;
  _validateField: <K extends keyof T>(name: K) => Promise<FieldError | undefined>;
  _validateForm: () => Promise<{ valid: boolean; errors: FieldErrors<T> }>;
  _subscribe: (callback: () => void) => () => void;
  _notify: () => void;
};

export type FieldArrayOptions = {
  control: Control<FieldValues>;
  name: string;
};

export type UseFieldArrayReturn<T extends FieldValues = FieldValues> = {
  fields: Array<T & { id: string }>;
  append: (value: T | T[]) => void;
  prepend: (value: T | T[]) => void;
  remove: (index?: number | number[]) => void;
  insert: (index: number, value: T | T[]) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  replace: (index: number, value: T) => void;
  update: (index: number, value: T) => void;
};

export type FormProviderProps<T extends FieldValues> = {
  children: React.ReactNode;
} & UseFormReturn<T>;

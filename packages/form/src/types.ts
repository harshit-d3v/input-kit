import type { z } from 'zod';
import type { ChangeEvent, FocusEvent } from 'react';

export type FieldValues = Record<string, unknown>;

/** Values that are leaves — recursion into them would produce nonsense paths. */
type Leaf = string | number | boolean | bigint | symbol | null | undefined | Date | File | FileList;

/**
 * Every dotted path into `T`, array indices included.
 *
 * For `{ teamName: string; members: { name: string }[] }` this is
 * `'teamName' | 'members' | \`members.${number}\` | \`members.${number}.name\``.
 *
 * Field arrays are the whole reason this exists: `register('members.0.name')` is the
 * normal way to register a repeated field, and a type of `keyof T` rejects it, since
 * `'members.0.name'` is not a key of anything.
 */
export type Path<T> = T extends Leaf
  ? never
  : T extends readonly (infer U)[]
    ? `${number}` | (Path<U> extends never ? never : `${number}.${Path<U>}`)
    : T extends object
      ? {
          [K in keyof T & string]:
            | K
            | (Path<NonNullable<T[K]>> extends never
                ? never
                : `${K}.${Path<NonNullable<T[K]>>}`);
        }[keyof T & string]
      : never;

/** The type sitting at path `P` within `T`. */
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? T extends readonly (infer U)[]
    ? PathValue<U, Rest>
    : K extends keyof T
      ? PathValue<NonNullable<T[K]>, Rest>
      : unknown
  : T extends readonly (infer U)[]
    ? U
    : P extends keyof T
      ? T[P]
      : unknown;

export type FieldError = {
  message: string;
  type: string;
};

/**
 * Errors keyed by dotted path, matching how they are stored.
 *
 * Zod issue paths are joined with `.`, so a failure on the second member's name
 * lands at `errors['members.1.name']` rather than nested under
 * `errors.members[1].name`. Keying this on {@link Path} rather than `keyof T` is
 * what makes those reads typed instead of an implicit `any`.
 */
export type FieldErrors<T extends FieldValues> = {
  [K in Path<T>]?: FieldError;
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
  dirtyFields: Partial<Record<Path<T>, boolean>>;
  touchedFields: Partial<Record<Path<T>, boolean>>;
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
  register: (name: Path<T>, options?: RegisterOptions) => RegisterResult;
  handleSubmit: (
    onValid: (data: T) => void | Promise<void>,
    onInvalid?: (errors: FieldErrors<T>) => void | Promise<void>
  ) => (e?: React.FormEvent) => Promise<void>;
  watch: <K extends Path<T>>(name?: K) => K extends Path<T> ? PathValue<T, K> : T;
  setValue: <K extends Path<T>>(
    name: K,
    value: PathValue<T, K>,
    options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }
  ) => void;
  getValues: <K extends Path<T>>(name?: K) => K extends Path<T> ? PathValue<T, K> : T;
  setError: <K extends Path<T>>(name: K, error: FieldError) => void;
  clearErrors: <K extends Path<T>>(name?: K | K[]) => void;
  reset: (values?: Partial<T>) => void;
  trigger: <K extends Path<T>>(name?: K | K[]) => Promise<boolean>;
  formState: FormState<T>;
  control: Control<T>;
};

export type Control<T extends FieldValues> = {
  _formState: FormState<T>;
  _fields: Map<Path<T>, FieldState>;
  _values: T;
  _defaultValues: T;
  _schema: z.ZodType<T>;
  _options: UseFormOptions<T>;
  _subscribers: Set<() => void>;
  _updateFormState: (updates: Partial<FormState<T>>) => void;
  _setFieldValue: <K extends Path<T>>(name: K, value: PathValue<T, K>) => void;
  _setFieldDirty: <K extends Path<T>>(name: K, isDirty: boolean) => void;
  _setFieldTouched: <K extends Path<T>>(name: K, isTouched: boolean) => void;
  _validateField: <K extends Path<T>>(name: K) => Promise<FieldError | undefined>;
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

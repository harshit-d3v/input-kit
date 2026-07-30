// Move the form package's field addressing from `keyof T` (top-level keys only) to
// `Path<T>` (dotted paths, array indices included), so field arrays are typed and
// nested reads and writes actually resolve at runtime.
import { readFileSync, writeFileSync } from 'node:fs';

const FORM = 'C:/harshitJet/input-kit/packages/form/src';

function edit(file, pairs) {
  const path = `${FORM}/${file}`;
  let src = readFileSync(path, 'utf8');
  let applied = 0;

  for (const [from, to, expected = 1] of pairs) {
    const count = src.split(from).length - 1;
    if (count !== expected) {
      console.error(`  ! ${file}: "${from.slice(0, 60)}" found ${count}x, expected ${expected}`);
      continue;
    }
    src = src.split(from).join(to);
    applied += count;
  }

  writeFileSync(path, src);
  console.log(`${file}: ${applied} replacements`);
}

edit('useForm.ts', [
  // Types and helpers for path-based addressing.
  [
    `import type {
  FieldError,
  FieldErrors,
  FieldState,
  FieldValues,
  FormState,
  RegisterResult,
  UseFormOptions,
  UseFormReturn,
  Control,
} from './types.js';
import {
  cloneObject,
  isFieldDirty,
  validateField,
  zodErrorToFieldErrors,
} from './utils.js';`,
    `import type {
  FieldError,
  FieldErrors,
  FieldState,
  FieldValues,
  FormState,
  Path,
  PathValue,
  RegisterResult,
  UseFormOptions,
  UseFormReturn,
  Control,
} from './types.js';
import {
  cloneObject,
  getNestedValue,
  isFieldDirty,
  setNestedValue,
  validateField,
  zodErrorToFieldErrors,
} from './utils.js';`,
  ],

  // Field bookkeeping is keyed by path, not by top-level key.
  ['useRef<Map<keyof T, FieldState>>', 'useRef<Map<Path<T>, FieldState>>'],
  [
    'useRef<Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>',
    'useRef<Map<Path<T>, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>',
  ],

  // Public and internal signatures.
  ['<K extends keyof T>', '<K extends Path<T>>', 9],
  ['(name: keyof T): RegisterResult', '(name: Path<T>): RegisterResult'],
  ['K extends keyof T ? T[K] : T', 'K extends Path<T> ? PathValue<T, K> : T', 6],
  ["Object.keys(errors)[0] as keyof T", "Object.keys(errors)[0] as Path<T>"],

  // Nested reads and writes. Flat indexing silently yields undefined for a dotted
  // path, which is what made `members.0.name` appear to register and then do nothing.
  [
    `  const setFieldValue = useCallback(<K extends Path<T>>(name: K, value: T[K]) => {
    valuesRef.current[name] = value;
  }, []);`,
    `  const setFieldValue = useCallback(<K extends Path<T>>(name: K, value: PathValue<T, K>) => {
    setNestedValue(valuesRef.current, name as string, value);
  }, []);`,
  ],
  [
    'return valuesRef.current[name] as K extends Path<T> ? PathValue<T, K> : T;',
    'return getNestedValue(valuesRef.current, name as string) as K extends Path<T> ? PathValue<T, K> : T;',
    2,
  ],
  ['setFieldValue(name, value as T[keyof T]);', 'setFieldValue(name, value as PathValue<T, Path<T>>);'],
]);

edit('utils.ts', [
  ['import type { FieldError, FieldErrors, FieldValues, SortState } from', 'SKIP', 0],
  // validateField addresses a single field, which may be nested.
  [
    `export function validateField<T extends FieldValues>(
  schema: z.ZodType<T>,
  values: T,
  name: keyof T
): FieldError | undefined {`,
    `export function validateField<T extends FieldValues>(
  schema: z.ZodType<T>,
  values: T,
  name: Path<T>
): FieldError | undefined {`,
  ],
]);

edit('types.ts', [
  ['  _fields: Map<keyof T, FieldState>;', '  _fields: Map<Path<T>, FieldState>;'],
  [
    '  _setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;',
    '  _setFieldValue: <K extends Path<T>>(name: K, value: PathValue<T, K>) => void;',
  ],
  ['  _setFieldDirty: <K extends keyof T>(name: K, isDirty: boolean) => void;', '  _setFieldDirty: <K extends Path<T>>(name: K, isDirty: boolean) => void;'],
  ['  _setFieldTouched: <K extends keyof T>(name: K, isTouched: boolean) => void;', '  _setFieldTouched: <K extends Path<T>>(name: K, isTouched: boolean) => void;'],
  [
    '  _validateField: <K extends keyof T>(name: K) => Promise<FieldError | undefined>;',
    '  _validateField: <K extends Path<T>>(name: K) => Promise<FieldError | undefined>;',
  ],
  ['  dirtyFields: Partial<Record<keyof T, boolean>>;', '  dirtyFields: Partial<Record<Path<T>, boolean>>;'],
  ['  touchedFields: Partial<Record<keyof T, boolean>>;', '  touchedFields: Partial<Record<Path<T>, boolean>>;'],
]);

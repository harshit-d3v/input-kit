import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { FieldValues, Path, PathValue, UseFormReturn, FormProviderProps } from './types.js';
import { getNestedValue } from './utils.js';

const FormContext = createContext<UseFormReturn<FieldValues> | null>(null);

export function FormProvider<T extends FieldValues>({
  children,
  ...formMethods
}: FormProviderProps<T>): React.ReactElement {
  const value = useMemo(() => formMethods as UseFormReturn<FieldValues>, [formMethods]);

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<T extends FieldValues>(): UseFormReturn<T> {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context as UseFormReturn<T>;
}

/** Watch every value in the form. */
export function useWatch<T extends FieldValues>(): T;
/** Watch every value in the form, against an explicit control. */
export function useWatch<T extends FieldValues>(options: {
  control?: UseFormReturn<T>['control'];
}): T;
/** Watch a single field, addressed by path. */
export function useWatch<T extends FieldValues, K extends Path<T>>(options: {
  name: K;
  control?: UseFormReturn<T>['control'];
}): PathValue<T, K>;

/**
 * Subscribe to form values and re-render when they change.
 *
 * Called with no `name` it returns the whole values object, which is what a live
 * preview wants. With a `name` it returns just that field, and the name may be a
 * dotted path so field-array entries work: `useWatch({ name: 'members.0.email' })`.
 *
 * @example
 * const all = useWatch<ProfileData>();
 * const email = useWatch<ProfileData, 'email'>({ name: 'email' });
 */
export function useWatch<T extends FieldValues, K extends Path<T>>(
  options: { name?: K; control?: UseFormReturn<T>['control'] } = {},
): PathValue<T, K> | T {
  const { name, control: controlProp } = options;
  const context = useFormContext<T>();
  const control = controlProp ?? context.control;

  // Values live in an object that is mutated in place, so its identity never
  // changes and cannot be used as a change signal. Re-render on notification and
  // read the current value during render instead.
  const [, bump] = useReducer((n: number) => n + 1, 0);

  useEffect(() => control._subscribe(bump), [control]);

  if (name === undefined) {
    return control._values as T;
  }
  return getNestedValue(control._values, name as string) as PathValue<T, K>;
}

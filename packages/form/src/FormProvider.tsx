import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import type { FieldValues, UseFormReturn, FormProviderProps } from './types.js';

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

export function useWatch<T extends FieldValues, K extends keyof T>(
  options: { name: K; control?: UseFormReturn<T>['control'] }
): T[K] {
  const { name, control: controlProp } = options;
  const context = useFormContext<T>();
  const control = controlProp || context.control;

  // Use sync external store to subscribe to form changes
  const value = useSyncExternalStore(
    (callback) => control._subscribe(callback),
    () => control._values[name],
    () => control._defaultValues[name]
  );

  return value;
}

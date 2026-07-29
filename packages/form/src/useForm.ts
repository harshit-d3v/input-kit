import { useCallback, useRef, useState } from 'react';
// ZodType is used via Control type from types.js
import type {
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
} from './utils.js';

export function useForm<T extends FieldValues>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { schema, defaultValues = {} as Partial<T>, mode = 'onSubmit', reValidateMode = 'onChange', shouldFocusError = true } = options;

  // Initialize refs
  const fieldsRef = useRef<Map<keyof T, FieldState>>(new Map());
  const valuesRef = useRef<T>(cloneObject(defaultValues) as T);
  const defaultValuesRef = useRef<T>(cloneObject(defaultValues) as T);
  const fieldElementsRef = useRef<Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>(new Map());
  const subscribersRef = useRef<Set<() => void>>(new Set());

  // Initialize form state
  const [formState, setFormState] = useState<FormState<T>>({
    errors: {} as FieldErrors<T>,
    isDirty: false,
    isSubmitting: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isValid: false,
    isValidating: false,
    dirtyFields: {},
    touchedFields: {},
    submitCount: 0,
  });

  // Subscribe mechanism for external store
  const subscribe = useCallback((callback: () => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const notifySubscribers = useCallback(() => {
    subscribersRef.current.forEach((callback) => callback());
  }, []);

  // Update form state helper
  const updateFormState = useCallback((updates: Partial<FormState<T>>) => {
    setFormState((prev) => {
      const newState = { ...prev, ...updates };
      return newState;
    });
    notifySubscribers();
  }, [notifySubscribers]);

  // Validate a single field
  const validateFieldFn = useCallback(
    async <K extends keyof T>(name: K): Promise<FieldError | undefined> => {
      const error = validateField(schema, valuesRef.current, name);
      return error;
    },
    [schema]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<{ valid: boolean; errors: FieldErrors<T> }> => {
    updateFormState({ isValidating: true });

    const result = schema.safeParse(valuesRef.current);

    updateFormState({ isValidating: false });

    if (result.success) {
      return { valid: true, errors: {} as FieldErrors<T> };
    } else {
      const errors = zodErrorToFieldErrors(result.error);
      return { valid: false, errors };
    }
  }, [schema, updateFormState]);

  // Set field value
  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    valuesRef.current[name] = value;
  }, []);

  // Set field dirty state
  const setFieldDirty = useCallback(<K extends keyof T>(name: K, isDirty: boolean) => {
    const currentFieldState = fieldsRef.current.get(name) || { isDirty: false, isTouched: false, isValidating: false };
    fieldsRef.current.set(name, { ...currentFieldState, isDirty });

    // Use functional update to read latest state and avoid stale closure
    setFormState((prev) => ({
      ...prev,
      dirtyFields: { ...prev.dirtyFields, [name]: isDirty },
      isDirty: isDirty || Object.values({ ...prev.dirtyFields, [name]: isDirty }).some(Boolean),
    }));
    notifySubscribers();
  }, [notifySubscribers]);

  // Set field touched state
  const setFieldTouched = useCallback(<K extends keyof T>(name: K, isTouched: boolean) => {
    const currentFieldState = fieldsRef.current.get(name) || { isDirty: false, isTouched: false, isValidating: false };
    fieldsRef.current.set(name, { ...currentFieldState, isTouched });

    // Use functional update to read latest state and avoid stale closure
    setFormState((prev) => ({
      ...prev,
      touchedFields: { ...prev.touchedFields, [name]: isTouched },
    }));
    notifySubscribers();
  }, [notifySubscribers]);

  // Register a field
  const register = useCallback(
    (name: keyof T): RegisterResult => {
      const fieldName = name as string;

      // Initialize field state if not exists
      if (!fieldsRef.current.has(name)) {
        fieldsRef.current.set(name, {
          isDirty: false,
          isTouched: false,
          isValidating: false,
        });
      }

      return {
        name: fieldName,
        onChange: async (e) => {
          const value = e.target.type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked 
            : e.target.value;
          
          setFieldValue(name, value as T[keyof T]);

          const isDirty = isFieldDirty(defaultValuesRef.current, valuesRef.current, name);
          setFieldDirty(name, isDirty);

          if (mode === 'onChange' || mode === 'all' || (formState.isSubmitted && reValidateMode === 'onChange')) {
            const error = await validateFieldFn(name);
            // Use functional update to avoid stale closure on formState.errors
            setFormState((prev) => {
              const newErrors = { ...prev.errors };
              if (error) {
                newErrors[name] = error;
              } else {
                delete newErrors[name];
              }
              return { ...prev, errors: newErrors };
            });
            notifySubscribers();
          }
        },
        onBlur: async () => {
          setFieldTouched(name, true);

          if (mode === 'onBlur' || mode === 'all' || (formState.isSubmitted && reValidateMode === 'onBlur')) {
            const error = await validateFieldFn(name);
            // Use functional update to avoid stale closure on formState.errors
            setFormState((prev) => {
              const newErrors = { ...prev.errors };
              if (error) {
                newErrors[name] = error;
              } else {
                delete newErrors[name];
              }
              return { ...prev, errors: newErrors };
            });
            notifySubscribers();
          }
        },
        ref: (element) => {
          if (element) {
            fieldElementsRef.current.set(name, element);
          }
        },
      };
    },
    [formState.errors, formState.isSubmitted, mode, reValidateMode, setFieldDirty, setFieldTouched, setFieldValue, updateFormState, validateFieldFn]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (
      onValid: (data: T) => void | Promise<void>,
      onInvalid?: (errors: FieldErrors<T>) => void | Promise<void>
    ) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        updateFormState({ isSubmitting: true, isSubmitted: true });

        const { valid, errors } = await validateForm();

        if (valid) {
          try {
            await onValid(cloneObject(valuesRef.current));
            // Use functional update so submitCount reads from the latest state,
            // not from a stale closure captured when handleSubmit was created.
            setFormState((prev) => ({
              ...prev,
              isSubmitting: false,
              isSubmitSuccessful: true,
              submitCount: prev.submitCount + 1,
              errors: {} as FieldErrors<T>,
            }));
            notifySubscribers();
          } catch {
            setFormState((prev) => ({
              ...prev,
              isSubmitting: false,
              isSubmitSuccessful: false,
              submitCount: prev.submitCount + 1,
            }));
            notifySubscribers();
          }
        } else {
          setFormState((prev) => ({
            ...prev,
            isSubmitting: false,
            isSubmitSuccessful: false,
            errors,
            submitCount: prev.submitCount + 1,
          }));
          notifySubscribers();

          if (onInvalid) {
            await onInvalid(errors);
          }

          // Focus first error field
          if (shouldFocusError) {
            const firstErrorKey = Object.keys(errors)[0] as keyof T;
            const element = fieldElementsRef.current.get(firstErrorKey);
            if (element) {
              element.focus();
            }
          }
        }
      };
    },
    [shouldFocusError, updateFormState, validateForm, notifySubscribers]
  );

  // Watch a field or entire form
  const watch = useCallback(<K extends keyof T>(name?: K): K extends keyof T ? T[K] : T => {
    if (name) {
      return valuesRef.current[name] as K extends keyof T ? T[K] : T;
    }
    return cloneObject(valuesRef.current) as K extends keyof T ? T[K] : T;
  }, []);

  // Set value programmatically
  const setValue = useCallback(<K extends keyof T>(
    name: K,
    value: T[K],
    setValueOptions: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean } = {}
  ) => {
    const { shouldValidate = false, shouldDirty = true, shouldTouch = false } = setValueOptions;

    setFieldValue(name, value);

    if (shouldDirty) {
      const isDirty = isFieldDirty(defaultValuesRef.current, valuesRef.current, name);
      setFieldDirty(name, isDirty);
    }

    if (shouldTouch) {
      setFieldTouched(name, true);
    }

    if (shouldValidate) {
      validateFieldFn(name).then((error) => {
        // Use functional update to avoid stale closure on formState.errors
        setFormState((prev) => {
          const newErrors = { ...prev.errors };
          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }
          return { ...prev, errors: newErrors };
        });
        notifySubscribers();
      });
    }
  }, [notifySubscribers, setFieldDirty, setFieldTouched, setFieldValue, updateFormState, validateFieldFn]);

  // Get values
  const getValues = useCallback(<K extends keyof T>(name?: K): K extends keyof T ? T[K] : T => {
    if (name) {
      return valuesRef.current[name] as K extends keyof T ? T[K] : T;
    }
    return cloneObject(valuesRef.current) as K extends keyof T ? T[K] : T;
  }, []);

  // Set error manually
  const setError = useCallback(<K extends keyof T>(name: K, error: FieldError) => {
    // Use functional update to avoid stale closure on formState.errors
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
    notifySubscribers();
  }, [notifySubscribers]);

  // Clear errors
  const clearErrors = useCallback(<K extends keyof T>(name?: K | K[]) => {
    if (!name) {
      updateFormState({ errors: {} as FieldErrors<T> });
      return;
    }

    const names = Array.isArray(name) ? name : [name];
    // Use functional update to avoid stale closure on formState.errors
    setFormState((prev) => {
      const newErrors = { ...prev.errors };
      names.forEach((n) => {
        delete newErrors[n];
      });
      return { ...prev, errors: newErrors };
    });
    notifySubscribers();
  }, [notifySubscribers, updateFormState]);

  // Reset form
  const reset = useCallback((values?: Partial<T>) => {
    const newValues = values ? { ...defaultValuesRef.current, ...values } : defaultValuesRef.current;
    valuesRef.current = cloneObject(newValues) as T;

    fieldsRef.current.clear();
    fieldElementsRef.current.clear();

    updateFormState({
      errors: {} as FieldErrors<T>,
      isDirty: false,
      isSubmitting: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      isValid: false,
      isValidating: false,
      dirtyFields: {},
      touchedFields: {},
    });
  }, [updateFormState]);

  // Trigger validation
  const trigger = useCallback(async <K extends keyof T>(name?: K | K[]): Promise<boolean> => {
    if (!name) {
      const { valid, errors } = await validateForm();
      updateFormState({ errors, isValid: valid });
      return valid;
    }

    const names = Array.isArray(name) ? name : [name];
    const fieldErrors: Partial<FieldErrors<T>> = {};

    for (const fieldName of names) {
      const error = await validateFieldFn(fieldName);
      if (error) {
        fieldErrors[fieldName] = error;
      }
    }

    // Use functional update to avoid stale closure on formState.errors
    setFormState((prev) => {
      const newErrors = { ...prev.errors };
      names.forEach((n) => {
        if (fieldErrors[n]) {
          newErrors[n] = fieldErrors[n]!;
        } else {
          delete newErrors[n];
        }
      });
      return { ...prev, errors: newErrors };
    });
    notifySubscribers();

    return Object.keys(fieldErrors).length === 0;
  }, [notifySubscribers, updateFormState, validateFieldFn, validateForm]);

  // Create control object
  const control: Control<T> = {
    _formState: formState,
    _fields: fieldsRef.current,
    _values: valuesRef.current,
    _defaultValues: defaultValuesRef.current,
    _schema: schema,
    _options: options,
    _subscribers: subscribersRef.current,
    _updateFormState: updateFormState,
    _setFieldValue: setFieldValue,
    _setFieldDirty: setFieldDirty,
    _setFieldTouched: setFieldTouched,
    _validateField: validateFieldFn,
    _validateForm: validateForm,
    _subscribe: subscribe,
    _notify: notifySubscribers,
  };

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    reset,
    trigger,
    formState,
    control,
  };
}

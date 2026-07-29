import { useCallback, useRef, useState } from 'react';
import type { FieldValues, UseFieldArrayReturn, FieldArrayOptions } from './types.js';
import { generateId, cloneObject } from './utils.js';

interface FieldArrayItem<T extends FieldValues> extends FieldValues {
  id: string;
  __original: T;
}

export function useFieldArray<T extends FieldValues = FieldValues>(
  options: FieldArrayOptions
): UseFieldArrayReturn<T> {
  const { control, name } = options;
  const { _values, _setFieldValue, _updateFormState, _formState } = control;

  const nameStr = name as string;
  const getFieldArrayValue = useCallback((): T[] => {
    const value = (_values as Record<string, unknown>)[nameStr];
    return Array.isArray(value) ? value : [];
  }, [_values, nameStr]);

  // Initialize fields with IDs
  const initialValue = getFieldArrayValue();
  const initialFields: FieldArrayItem<T>[] = initialValue.map((item) => ({
    ...item,
    id: generateId(),
    __original: cloneObject(item),
  }));

  const [fields, setFields] = useState<FieldArrayItem<T>[]>(initialFields);
  const fieldsRef = useRef<FieldArrayItem<T>[]>(initialFields);

  // Update ref when fields change
  const updateFields = useCallback((newFields: FieldArrayItem<T>[]) => {
    fieldsRef.current = newFields;
    setFields(newFields);

    // Update the actual form values
    const values = newFields.map((field) => {
      const { id, __original, ...rest } = field as FieldArrayItem<T> & Record<string, unknown>;
      return rest as T;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_setFieldValue as (name: string, value: unknown) => void)(nameStr, values);
  }, [nameStr, _setFieldValue]);

  // Append items to the end
  const append = useCallback((value: T | T[]) => {
    const values = Array.isArray(value) ? value : [value];
    const newItems: FieldArrayItem<T>[] = values.map((v) => ({
      ...cloneObject(v),
      id: generateId(),
      __original: cloneObject(v),
    }));

    const newFields = [...fieldsRef.current, ...newItems];
    updateFields(newFields);

    // Mark form as dirty
    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Prepend items to the beginning
  const prepend = useCallback((value: T | T[]) => {
    const values = Array.isArray(value) ? value : [value];
    const newItems: FieldArrayItem<T>[] = values.map((v) => ({
      ...cloneObject(v),
      id: generateId(),
      __original: cloneObject(v),
    }));

    const newFields = [...newItems, ...fieldsRef.current];
    updateFields(newFields);

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Remove items by index
  const remove = useCallback((index?: number | number[]) => {
    if (index === undefined) {
      updateFields([]);
    } else {
      const indices = Array.isArray(index) ? index : [index];
      const newFields = fieldsRef.current.filter((_, i) => !indices.includes(i));
      updateFields(newFields);
    }

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Insert items at specific index
  const insert = useCallback((index: number, value: T | T[]) => {
    const values = Array.isArray(value) ? value : [value];
    const newItems: FieldArrayItem<T>[] = values.map((v) => ({
      ...cloneObject(v),
      id: generateId(),
      __original: cloneObject(v),
    }));

    const newFields = [
      ...fieldsRef.current.slice(0, index),
      ...newItems,
      ...fieldsRef.current.slice(index),
    ];
    updateFields(newFields);

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Swap two items
  const swap = useCallback((indexA: number, indexB: number) => {
    if (indexA === indexB ||
        indexA < 0 ||
        indexA >= fieldsRef.current.length ||
        indexB < 0 ||
        indexB >= fieldsRef.current.length) {
      return;
    }

    const newFields = [...fieldsRef.current];
    [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
    updateFields(newFields);

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Move item from one position to another
  const move = useCallback((from: number, to: number) => {
    if (from === to ||
        from < 0 ||
        from >= fieldsRef.current.length ||
        to < 0 ||
        to >= fieldsRef.current.length) {
      return;
    }

    const newFields = [...fieldsRef.current];
    const [movedItem] = newFields.splice(from, 1);
    newFields.splice(to, 0, movedItem);
    updateFields(newFields);

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Replace item at specific index
  const replace = useCallback((index: number, value: T) => {
    if (index < 0 || index >= fieldsRef.current.length) {
      return;
    }

    const newFields = [...fieldsRef.current];
    newFields[index] = {
      ...cloneObject(value),
      id: fieldsRef.current[index].id,
      __original: cloneObject(value),
    };
    updateFields(newFields);

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  // Update item at specific index (merge with existing)
  const update = useCallback((index: number, value: T) => {
    if (index < 0 || index >= fieldsRef.current.length) {
      return;
    }

    const newFields = [...fieldsRef.current];
    newFields[index] = {
      ...newFields[index],
      ...cloneObject(value),
      id: newFields[index].id,
    };
    updateFields(newFields);

    _updateFormState({
      isDirty: true,
      dirtyFields: { ..._formState.dirtyFields, [name]: true },
    });
  }, [name, _formState.dirtyFields, _updateFormState, updateFields]);

  return {
    fields: fields.map(({ id, __original, ...rest }) => ({ ...rest, id })) as Array<T & { id: string }>,
    append,
    prepend,
    remove,
    insert,
    swap,
    move,
    replace,
    update,
  };
}

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useForm } from './useForm.js';
import { useFieldArray } from './useFieldArray.js';

describe('useFieldArray', () => {
  const itemSchema = z.object({
    name: z.string(),
    value: z.number(),
  });

  const schema = z.object({
    items: z.array(itemSchema),
  });

  type FormData = z.infer<typeof schema>;

  const setup = (defaultItems: Array<{ name: string; value: number }> = []) => {
    const { result: formResult } = renderHook(() =>
      useForm({
        schema,
        defaultValues: { items: defaultItems },
      })
    );

    const { result: fieldArrayResult } = renderHook(() =>
      useFieldArray({
        control: formResult.current.control,
        name: 'items',
      })
    );

    return { formResult, fieldArrayResult };
  };

  describe('initialization', () => {
    it('should initialize with empty array', () => {
      const { fieldArrayResult } = setup();

      expect(fieldArrayResult.current.fields).toEqual([]);
    });

    it('should initialize with default values', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      expect(fieldArrayResult.current.fields).toHaveLength(2);
      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
      expect(fieldArrayResult.current.fields[1].name).toBe('item2');
    });

    it('should assign unique ids to fields', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      expect(fieldArrayResult.current.fields[0].id).toBeDefined();
      expect(fieldArrayResult.current.fields[1].id).toBeDefined();
      expect(fieldArrayResult.current.fields[0].id).not.toBe(fieldArrayResult.current.fields[1].id);
    });
  });

  describe('append', () => {
    it('should append a single item', () => {
      const { fieldArrayResult } = setup();

      act(() => {
        fieldArrayResult.current.append({ name: 'item1', value: 1 });
      });

      expect(fieldArrayResult.current.fields).toHaveLength(1);
      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
    });

    it('should append multiple items', () => {
      const { fieldArrayResult } = setup();

      act(() => {
        fieldArrayResult.current.append([
          { name: 'item1', value: 1 },
          { name: 'item2', value: 2 },
        ]);
      });

      expect(fieldArrayResult.current.fields).toHaveLength(2);
    });

    it('should append to existing items', () => {
      const { fieldArrayResult } = setup([{ name: 'existing', value: 0 }]);

      act(() => {
        fieldArrayResult.current.append({ name: 'new', value: 1 });
      });

      expect(fieldArrayResult.current.fields).toHaveLength(2);
      expect(fieldArrayResult.current.fields[1].name).toBe('new');
    });
  });

  describe('prepend', () => {
    it('should prepend a single item', () => {
      const { fieldArrayResult } = setup([{ name: 'existing', value: 0 }]);

      act(() => {
        fieldArrayResult.current.prepend({ name: 'new', value: 1 });
      });

      expect(fieldArrayResult.current.fields).toHaveLength(2);
      expect(fieldArrayResult.current.fields[0].name).toBe('new');
    });

    it('should prepend multiple items', () => {
      const { fieldArrayResult } = setup([{ name: 'existing', value: 0 }]);

      act(() => {
        fieldArrayResult.current.prepend([
          { name: 'new1', value: 1 },
          { name: 'new2', value: 2 },
        ]);
      });

      expect(fieldArrayResult.current.fields).toHaveLength(3);
      expect(fieldArrayResult.current.fields[0].name).toBe('new1');
      expect(fieldArrayResult.current.fields[1].name).toBe('new2');
    });
  });

  describe('remove', () => {
    it('should remove item at specific index', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
        { name: 'item3', value: 3 },
      ]);

      act(() => {
        fieldArrayResult.current.remove(1);
      });

      expect(fieldArrayResult.current.fields).toHaveLength(2);
      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
      expect(fieldArrayResult.current.fields[1].name).toBe('item3');
    });

    it('should remove multiple items by indices', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
        { name: 'item3', value: 3 },
        { name: 'item4', value: 4 },
      ]);

      act(() => {
        fieldArrayResult.current.remove([1, 3]);
      });

      expect(fieldArrayResult.current.fields).toHaveLength(2);
      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
      expect(fieldArrayResult.current.fields[1].name).toBe('item3');
    });

    it('should remove all items when no index provided', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.remove();
      });

      expect(fieldArrayResult.current.fields).toHaveLength(0);
    });
  });

  describe('insert', () => {
    it('should insert item at specific index', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item3', value: 3 },
      ]);

      act(() => {
        fieldArrayResult.current.insert(1, { name: 'item2', value: 2 });
      });

      expect(fieldArrayResult.current.fields).toHaveLength(3);
      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
      expect(fieldArrayResult.current.fields[1].name).toBe('item2');
      expect(fieldArrayResult.current.fields[2].name).toBe('item3');
    });

    it('should insert multiple items at specific index', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item4', value: 4 },
      ]);

      act(() => {
        fieldArrayResult.current.insert(1, [
          { name: 'item2', value: 2 },
          { name: 'item3', value: 3 },
        ]);
      });

      expect(fieldArrayResult.current.fields).toHaveLength(4);
      expect(fieldArrayResult.current.fields[1].name).toBe('item2');
      expect(fieldArrayResult.current.fields[2].name).toBe('item3');
    });
  });

  describe('swap', () => {
    it('should swap two items', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
        { name: 'item3', value: 3 },
      ]);

      act(() => {
        fieldArrayResult.current.swap(0, 2);
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('item3');
      expect(fieldArrayResult.current.fields[2].name).toBe('item1');
    });

    it('should not swap if indices are the same', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.swap(0, 0);
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
      expect(fieldArrayResult.current.fields[1].name).toBe('item2');
    });

    it('should not swap if index is out of bounds', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.swap(0, 10);
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('item1');
      expect(fieldArrayResult.current.fields[1].name).toBe('item2');
    });
  });

  describe('move', () => {
    it('should move item from one position to another', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
        { name: 'item3', value: 3 },
      ]);

      act(() => {
        fieldArrayResult.current.move(0, 2);
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('item2');
      expect(fieldArrayResult.current.fields[1].name).toBe('item3');
      expect(fieldArrayResult.current.fields[2].name).toBe('item1');
    });

    it('should move item backwards', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
        { name: 'item3', value: 3 },
      ]);

      act(() => {
        fieldArrayResult.current.move(2, 0);
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('item3');
      expect(fieldArrayResult.current.fields[1].name).toBe('item1');
      expect(fieldArrayResult.current.fields[2].name).toBe('item2');
    });
  });

  describe('replace', () => {
    it('should replace item at specific index', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.replace(0, { name: 'replaced', value: 99 });
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('replaced');
      expect(fieldArrayResult.current.fields[0].value).toBe(99);
      expect(fieldArrayResult.current.fields[1].name).toBe('item2');
    });

    it('should preserve id when replacing', () => {
      const { fieldArrayResult } = setup([{ name: 'item1', value: 1 }]);

      const originalId = fieldArrayResult.current.fields[0].id;

      act(() => {
        fieldArrayResult.current.replace(0, { name: 'replaced', value: 99 });
      });

      expect(fieldArrayResult.current.fields[0].id).toBe(originalId);
    });
  });

  describe('update', () => {
    it('should update item at specific index (merge)', () => {
      const { fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.update(0, { name: 'updated', value: 99 });
      });

      expect(fieldArrayResult.current.fields[0].name).toBe('updated');
      expect(fieldArrayResult.current.fields[0].value).toBe(99);
    });

    it('should preserve id when updating', () => {
      const { fieldArrayResult } = setup([{ name: 'item1', value: 1 }]);

      const originalId = fieldArrayResult.current.fields[0].id;

      act(() => {
        fieldArrayResult.current.update(0, { name: 'updated' });
      });

      expect(fieldArrayResult.current.fields[0].id).toBe(originalId);
    });
  });

  describe('form state integration', () => {
    it('should mark form as dirty when appending', () => {
      const { formResult, fieldArrayResult } = setup();

      act(() => {
        fieldArrayResult.current.append({ name: 'item1', value: 1 });
      });

      expect(formResult.current.formState.isDirty).toBe(true);
      expect(formResult.current.formState.dirtyFields.items).toBe(true);
    });

    it('should mark form as dirty when removing', () => {
      const { formResult, fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.remove(0);
      });

      expect(formResult.current.formState.isDirty).toBe(true);
    });

    it('should mark form as dirty when swapping', () => {
      const { formResult, fieldArrayResult } = setup([
        { name: 'item1', value: 1 },
        { name: 'item2', value: 2 },
      ]);

      act(() => {
        fieldArrayResult.current.swap(0, 1);
      });

      expect(formResult.current.formState.isDirty).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  zodErrorToFieldErrors,
  getNestedValue,
  setNestedValue,
  isFieldDirty,
  cloneObject,
  generateId,
  validateField,
  debounce,
} from './utils.js';

describe('utils', () => {
  describe('zodErrorToFieldErrors', () => {
    it('should convert ZodError to FieldErrors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const result = schema.safeParse({ email: 'invalid', age: 10 });

      if (!result.success) {
        const errors = zodErrorToFieldErrors(result.error);

        expect(errors.email).toBeDefined();
        expect(errors.age).toBeDefined();
        expect(errors.email?.message).toBeDefined();
        expect(errors.email?.type).toBeDefined();
      }
    });

    it('should handle nested paths', () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1),
        }),
      });

      const result = schema.safeParse({ user: { name: '' } });

      if (!result.success) {
        const errors = zodErrorToFieldErrors(result.error);

        expect(errors['user.name']).toBeDefined();
      }
    });
  });

  describe('getNestedValue', () => {
    it('should get nested value by path', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
          },
        },
      };

      expect(getNestedValue(obj, 'user.profile.name')).toBe('John');
    });

    it('should return undefined for non-existent path', () => {
      const obj = { user: {} };

      expect(getNestedValue(obj, 'user.profile.name')).toBeUndefined();
    });

    it('should handle empty path', () => {
      const obj = { name: 'test' };

      // Empty path returns undefined since we try to access obj['']
      expect(getNestedValue(obj, '')).toBeUndefined();
    });
  });

  describe('setNestedValue', () => {
    it('should set nested value by path', () => {
      const obj: Record<string, unknown> = {};

      setNestedValue(obj, 'user.profile.name', 'John');

      expect(obj).toEqual({
        user: {
          profile: {
            name: 'John',
          },
        },
      });
    });

    it('should create intermediate objects if needed', () => {
      const obj: Record<string, unknown> = { existing: 'value' };

      setNestedValue(obj, 'a.b.c', 'deep');

      expect(obj).toEqual({
        existing: 'value',
        a: {
          b: {
            c: 'deep',
          },
        },
      });
    });
  });

  describe('isFieldDirty', () => {
    it('should return true when values differ', () => {
      const defaultValues = { name: 'John', age: 30 };
      const currentValues = { name: 'Jane', age: 30 };

      expect(isFieldDirty(defaultValues, currentValues, 'name')).toBe(true);
    });

    it('should return false when values are the same', () => {
      const defaultValues = { name: 'John', age: 30 };
      const currentValues = { name: 'John', age: 30 };

      expect(isFieldDirty(defaultValues, currentValues, 'name')).toBe(false);
    });

    it('should return true when types differ', () => {
      const defaultValues = { count: 0 };
      const currentValues = { count: '0' as unknown as number };

      expect(isFieldDirty(defaultValues, currentValues, 'count')).toBe(true);
    });

    it('should compare objects by JSON stringification', () => {
      const defaultValues = { obj: { a: 1 } };
      const currentValues = { obj: { a: 2 } };

      expect(isFieldDirty(defaultValues, currentValues, 'obj')).toBe(true);
    });
  });

  describe('cloneObject', () => {
    it('should clone primitive values', () => {
      expect(cloneObject(5)).toBe(5);
      expect(cloneObject('test')).toBe('test');
      expect(cloneObject(null)).toBe(null);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = cloneObject(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = cloneObject(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone dates', () => {
      const date = new Date('2024-01-01');
      const cloned = cloneObject(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('validateField', () => {
    it('should return undefined for valid field', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const values = { email: 'test@example.com' };
      const error = validateField(schema, values, 'email');

      expect(error).toBeUndefined();
    });

    it('should return error for invalid field', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const values = { email: 'invalid' };
      const error = validateField(schema, values, 'email');

      expect(error).toBeDefined();
      expect(error?.message).toBeDefined();
      expect(error?.type).toBeDefined();
    });

    it('should return undefined when error is for different field', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
      });

      const values = { email: 'invalid', name: 'John' };
      const error = validateField(schema, values, 'name');

      expect(error).toBeUndefined();
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 50);

      debouncedFn('a');
      debouncedFn('b');
      debouncedFn('c');

      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('should reset timer on each call', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 50);

      debouncedFn('a');

      await new Promise((resolve) => setTimeout(resolve, 30));

      debouncedFn('b');

      await new Promise((resolve) => setTimeout(resolve, 30));

      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 30));

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('b');
    });
  });
});

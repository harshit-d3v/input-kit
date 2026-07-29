import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { useForm } from './useForm.js';

describe('useForm', () => {
  const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: '' },
        })
      );

      expect(result.current.getValues('email')).toBe('test@example.com');
      expect(result.current.getValues('password')).toBe('');
    });

    it('should initialize with empty default values if not provided', () => {
      const { result } = renderHook(() => useForm({ schema }));

      expect(result.current.getValues()).toEqual({});
    });

    it('should have correct initial form state', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '', password: '' },
        })
      );

      expect(result.current.formState.isDirty).toBe(false);
      expect(result.current.formState.isSubmitting).toBe(false);
      expect(result.current.formState.isSubmitted).toBe(false);
      expect(result.current.formState.isSubmitSuccessful).toBe(false);
      expect(result.current.formState.submitCount).toBe(0);
    });
  });

  describe('register', () => {
    it('should return register props', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '' },
        })
      );

      const registerResult = result.current.register('email');

      expect(registerResult.name).toBe('email');
      expect(typeof registerResult.onChange).toBe('function');
      expect(typeof registerResult.onBlur).toBe('function');
      expect(typeof registerResult.ref).toBe('function');
    });
  });

  describe('setValue and getValues', () => {
    it('should set and get field value', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '', password: '' },
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      expect(result.current.getValues('email')).toBe('test@example.com');
    });

    it('should get all values when no name is provided', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: 'password123' },
        })
      );

      const values = result.current.getValues();

      expect(values).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should mark field as dirty when value changes', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'default@example.com', password: '' },
        })
      );

      act(() => {
        result.current.setValue('email', 'new@example.com');
      });

      expect(result.current.formState.dirtyFields.email).toBe(true);
      expect(result.current.formState.isDirty).toBe(true);
    });

    it('should not mark field as dirty when value is same as default', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: '' },
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      expect(result.current.formState.dirtyFields.email).toBeFalsy();
    });
  });

  describe('watch', () => {
    it('should watch field value', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: '' },
        })
      );

      const email = result.current.watch('email');

      expect(email).toBe('test@example.com');
    });

    it('should watch all values', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: 'secret' },
        })
      );

      const values = result.current.watch();

      expect(values).toEqual({
        email: 'test@example.com',
        password: 'secret',
      });
    });
  });

  describe('validation', () => {
    it('should validate on submit', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'invalid', password: 'short' },
          mode: 'onSubmit',
        })
      );

      const onSubmit = vi.fn();
      const onInvalid = vi.fn();

      await act(async () => {
        await result.current.handleSubmit(onSubmit, onInvalid)();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onInvalid).toHaveBeenCalled();
      expect(result.current.formState.errors.email).toBeDefined();
      expect(result.current.formState.errors.password).toBeDefined();
    });

    it('should call onSubmit when form is valid', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: 'password123' },
        })
      );

      const onSubmit = vi.fn();

      await act(async () => {
        await result.current.handleSubmit(onSubmit)();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.current.formState.isSubmitSuccessful).toBe(true);
    });

    it('should validate single field with trigger', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'invalid', password: 'password123' },
        })
      );

      let isValid: boolean | undefined;

      await act(async () => {
        isValid = await result.current.trigger('email');
      });

      expect(isValid).toBe(false);
      expect(result.current.formState.errors.email).toBeDefined();
      expect(result.current.formState.errors.password).toBeUndefined();
    });

    it('should validate all fields with trigger', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'invalid', password: 'short' },
        })
      );

      let isValid: boolean | undefined;

      await act(async () => {
        isValid = await result.current.trigger();
      });

      expect(isValid).toBe(false);
      expect(result.current.formState.errors.email).toBeDefined();
      expect(result.current.formState.errors.password).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should set error manually', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '', password: '' },
        })
      );

      act(() => {
        result.current.setError('email', { message: 'Custom error', type: 'custom' });
      });

      expect(result.current.formState.errors.email).toEqual({
        message: 'Custom error',
        type: 'custom',
      });
    });

    it('should clear specific error', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '', password: '' },
        })
      );

      act(() => {
        result.current.setError('email', { message: 'Error', type: 'custom' });
        result.current.setError('password', { message: 'Error', type: 'custom' });
      });

      act(() => {
        result.current.clearErrors('email');
      });

      expect(result.current.formState.errors.email).toBeUndefined();
      expect(result.current.formState.errors.password).toBeDefined();
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '', password: '' },
        })
      );

      act(() => {
        result.current.setError('email', { message: 'Error', type: 'custom' });
        result.current.setError('password', { message: 'Error', type: 'custom' });
      });

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.formState.errors).toEqual({});
    });

    it('should clear multiple specific errors', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: '', password: '', name: '' },
        })
      );

      act(() => {
        result.current.setError('email', { message: 'Error', type: 'custom' });
        result.current.setError('password', { message: 'Error', type: 'custom' });
        result.current.setError('name', { message: 'Error', type: 'custom' });
      });

      act(() => {
        result.current.clearErrors(['email', 'password']);
      });

      expect(result.current.formState.errors.email).toBeUndefined();
      expect(result.current.formState.errors.password).toBeUndefined();
      expect(result.current.formState.errors.name).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset form to default values', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'default@example.com', password: '' },
        })
      );

      act(() => {
        result.current.setValue('email', 'changed@example.com');
        result.current.setError('email', { message: 'Error', type: 'custom' });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.getValues('email')).toBe('default@example.com');
      expect(result.current.formState.errors).toEqual({});
      expect(result.current.formState.isDirty).toBe(false);
    });

    it('should reset form with new values', () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'default@example.com', password: '' },
        })
      );

      act(() => {
        result.current.setValue('email', 'changed@example.com');
      });

      act(() => {
        result.current.reset({ email: 'new@example.com' });
      });

      expect(result.current.getValues('email')).toBe('new@example.com');
    });
  });

  describe('form submission', () => {
    it('should track submit count', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: 'password123' },
        })
      );

      await act(async () => {
        await result.current.handleSubmit(() => {})();
      });

      expect(result.current.formState.submitCount).toBe(1);

      await act(async () => {
        await result.current.handleSubmit(() => {})();
      });

      expect(result.current.formState.submitCount).toBe(2);
    });

    it('should set isSubmitting during submission', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: 'password123' },
        })
      );

      let submitPromise: Promise<void> | undefined;

      act(() => {
        submitPromise = result.current.handleSubmit(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        })();
      });

      // isSubmitting should be true immediately after calling handleSubmit
      expect(result.current.formState.isSubmitting).toBe(true);

      await act(async () => {
        await submitPromise;
      });

      expect(result.current.formState.isSubmitting).toBe(false);
    });

    it('should mark as submitted after submission', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema,
          defaultValues: { email: 'test@example.com', password: 'password123' },
        })
      );

      await act(async () => {
        const submitHandler = result.current.handleSubmit(() => {});
        await submitHandler();
      });

      expect(result.current.formState.isSubmitted).toBe(true);
    });
  });
});

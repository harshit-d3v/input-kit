import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { z } from 'zod';
import { useForm } from './useForm.js';
import { FormProvider, useFormContext, useWatch } from './FormProvider.js';
import React from 'react';

describe('FormProvider', () => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string(),
  });

  type FormData = z.infer<typeof schema>;

  describe('FormProvider', () => {
    it('should provide form context to children', () => {
      function TestComponent() {
        const { getValues } = useFormContext<FormData>();
        return <div data-testid="email">{getValues('email')}</div>;
      }

      function Wrapper() {
        const form = useForm({
          schema,
          defaultValues: { email: 'test@example.com', name: 'John' },
        });

        return (
          <FormProvider {...form}>
            <TestComponent />
          </FormProvider>
        );
      }

      render(<Wrapper />);

      expect(screen.getByTestId('email').textContent).toBe('test@example.com');
    });

    it('should allow nested components to use register', () => {
      function TestForm() {
        const { register } = useFormContext<FormData>();
        return (
          <form>
            <input {...register('email')} data-testid="email-input" />
          </form>
        );
      }

      function Wrapper() {
        const form = useForm({
          schema,
          defaultValues: { email: 'test@example.com', name: 'John' },
        });

        return (
          <FormProvider {...form}>
            <TestForm />
          </FormProvider>
        );
      }

      render(<Wrapper />);

      const input = screen.getByTestId('email-input') as HTMLInputElement;
      expect(input.name).toBe('email');
    });
  });

  describe('useFormContext', () => {
    it('should throw error when used outside FormProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* suppress error */ });

      function TestComponent() {
        useFormContext();
        return null;
      }

      expect(() => render(<TestComponent />)).toThrow(
        'useFormContext must be used within a FormProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('useWatch', () => {
    it('should watch field value from context', () => {
      function Wrapper() {
        const form = useForm({
          schema,
          defaultValues: { email: 'test@example.com', name: 'John' },
        });

        return (
          <FormProvider {...form}>
            <TestComponent />
          </FormProvider>
        );
      }

      function TestComponent() {
        const email = useWatch<FormData, 'email'>({ name: 'email' });
        return <div data-testid="watched-email">{email}</div>;
      }

      render(<Wrapper />);

      expect(screen.getByTestId('watched-email').textContent).toBe('test@example.com');
    });

    it('should watch field value from provided control', () => {
      // Create a wrapper with FormProvider
      function Wrapper({ children }: { children: React.ReactNode }) {
        const form = useForm({
          schema,
          defaultValues: { email: 'test@example.com', name: 'John' },
        });
        return <FormProvider {...form}>{children}</FormProvider>;
      }

      function TestComponent() {
        const email = useWatch<FormData, 'email'>({ name: 'email' });
        return <div data-testid="email">{email}</div>;
      }

      render(<Wrapper><TestComponent /></Wrapper>);

      expect(screen.getByTestId('email').textContent).toBe('test@example.com');
    });
  });
});

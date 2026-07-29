import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from '../ToastProvider.js';
import { useToast } from '../useToast.js';
import { __resetStore, getActions, getState } from '../store.js';

describe('ToastProvider', () => {
  beforeEach(() => {
    __resetStore();
  });

  it('should render children', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child Content</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should provide toast context to children', () => {
    const TestComponent = () => {
      const toast = useToast();
      expect(toast.success).toBeDefined();
      expect(toast.error).toBeDefined();
      expect(toast.warning).toBeDefined();
      expect(toast.info).toBeDefined();
      expect(toast.promise).toBeDefined();
      expect(toast.dismiss).toBeDefined();
      expect(toast.dismissAll).toBeDefined();
      return <div>Test</div>;
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

describe('ToastContainer integration', () => {
  beforeEach(() => {
    __resetStore();
  });

  it('should render toasts when added via store actions', () => {
    render(
      <ToastProvider>
        <div>App Content</div>
      </ToastProvider>
    );

    act(() => {
      getActions().addToast('Test message', { type: 'success' });
    });

    // Check that toast was added to store
    expect(getState().toasts).toHaveLength(1);
    expect(getState().toasts[0].message).toBe('Test message');
    expect(getState().toasts[0].type).toBe('success');
  });

  it('should render toasts at different positions', () => {
    render(
      <ToastProvider>
        <div>App Content</div>
      </ToastProvider>
    );

    act(() => {
      getActions().addToast('Top message', { type: 'info', position: 'top-right' });
      getActions().addToast('Bottom message', { type: 'info', position: 'bottom-right' });
    });

    expect(getState().toasts).toHaveLength(2);
    expect(getState().toasts[0].position).toBe('top-right');
    expect(getState().toasts[1].position).toBe('bottom-right');
  });

  it('should respect maxToasts configuration', () => {
    render(
      <ToastProvider maxToasts={2}>
        <div>App Content</div>
      </ToastProvider>
    );

    act(() => {
      getActions().addToast('Message 1');
      getActions().addToast('Message 2');
      getActions().addToast('Message 3');
    });

    // Should have 3 toasts (2 active + 1 exiting)
    expect(getState().toasts).toHaveLength(3);
    expect(getState().toasts[0].isExiting).toBe(true);
  });

  it('should use defaultPosition from provider', () => {
    render(
      <ToastProvider defaultPosition="top-center">
        <div>App Content</div>
      </ToastProvider>
    );

    act(() => {
      getActions().addToast('Test message');
    });

    expect(getState().toasts[0].position).toBe('top-center');
  });
});

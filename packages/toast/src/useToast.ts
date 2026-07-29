import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ToastOptions, PromiseToastOptions } from './types.js';
import { getActions } from './store.js';

/**
 * Hook to interact with toast notifications
 * Can be used outside of React components via the toast object
 */
export const useToast = () => {
  const actions = getActions();

  const success = useCallback(
    (message: ReactNode, options?: Omit<ToastOptions, 'type'>) => {
      return actions.addToast(message, { ...options, type: 'success' });
    },
    [actions]
  );

  const error = useCallback(
    (message: ReactNode, options?: Omit<ToastOptions, 'type'>) => {
      return actions.addToast(message, { ...options, type: 'error' });
    },
    [actions]
  );

  const warning = useCallback(
    (message: ReactNode, options?: Omit<ToastOptions, 'type'>) => {
      return actions.addToast(message, { ...options, type: 'warning' });
    },
    [actions]
  );

  const info = useCallback(
    (message: ReactNode, options?: Omit<ToastOptions, 'type'>) => {
      return actions.addToast(message, { ...options, type: 'info' });
    },
    [actions]
  );

  const custom = useCallback(
    (message: ReactNode, options?: ToastOptions) => {
      return actions.addToast(message, options);
    },
    [actions]
  );

  const dismiss = useCallback(
    (id: string) => {
      actions.dismissToast(id);
    },
    [actions]
  );

  const dismissAll = useCallback(() => {
    actions.dismissAll();
  }, [actions]);

  const promise = useCallback(
    <T>(promiseInstance: Promise<T>, options: PromiseToastOptions<T>) => {
      return actions.promise(promiseInstance, options);
    },
    [actions]
  );

  return {
    success,
    error,
    warning,
    info,
    custom,
    dismiss,
    dismissAll,
    promise,
  };
};

/**
 * Standalone toast object for use outside of React components
 */
export { toast, configure } from './store.js';

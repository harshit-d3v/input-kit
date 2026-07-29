import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ToastContextValue } from './types.js';
import { subscribe, getState, getActions } from './store.js';

// Create context with undefined default
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Hook to use toast context
export const useToastContext = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// Hook to subscribe to toast store
export const useToastStore = (): ToastContextValue => {
  const state = useSyncExternalStore(
    subscribe,
    getState,
    getState
  );
  
  const actions = getActions();
  
  return {
    ...state,
    ...actions,
  };
};

export { ToastContext };

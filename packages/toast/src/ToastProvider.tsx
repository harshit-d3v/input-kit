import { useMemo, useEffect } from 'react';
// ReactNode type is available via the FC type
import { ToastContext } from './ToastContext.js';
import { useToastStore } from './ToastContext.js';
import type { ToastProviderProps, ToastContextValue, ToastPosition } from './types.js';
import { ToastContainer } from './ToastContainer.js';
import { configure } from './store.js';

/**
 * ToastProvider component
 * Wraps the application and provides toast functionality
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts,
  defaultDuration,
  defaultPosition,
  reverseOrder = false,
  gutter = 8,
  containerStyle,
  toastStyle,
}) => {
  const store = useToastStore();

  // Configure defaults on mount
  useEffect(() => {
    const config: { maxToasts?: number; defaultDuration?: number; defaultPosition?: ToastPosition } = {};
    if (maxToasts !== undefined) config.maxToasts = maxToasts;
    if (defaultDuration !== undefined) config.defaultDuration = defaultDuration;
    if (defaultPosition !== undefined) config.defaultPosition = defaultPosition;
    
    if (Object.keys(config).length > 0) {
      configure(config);
    }
  }, [maxToasts, defaultDuration, defaultPosition]);

  const contextValue = useMemo<ToastContextValue>(() => store, [store]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        reverseOrder={reverseOrder}
        gutter={gutter}
        containerStyle={containerStyle}
        toastStyle={toastStyle}
      />
    </ToastContext.Provider>
  );
};

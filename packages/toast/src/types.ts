import type { ReactNode } from 'react';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast position on screen
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast animation direction
 */
export type AnimationDirection = 'slide' | 'fade' | 'zoom';

/**
 * Action button in toast
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Toast data structure
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: ReactNode;
  duration: number;
  position: ToastPosition;
  createdAt: number;
  progress: number;
  isPaused: boolean;
  isExiting: boolean;
  action?: ToastAction;
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

/**
 * Options for creating a toast
 */
export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  duration?: number;
  position?: ToastPosition;
  action?: ToastAction;
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

/**
 * Promise toast options
 */
export interface PromiseToastOptions<T = unknown> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
  duration?: number;
  position?: ToastPosition;
}

/**
 * Toast state in store
 */
export interface ToastState {
  toasts: Toast[];
  maxToasts: number;
  defaultDuration: number;
  defaultPosition: ToastPosition;
}

/**
 * Toast store actions
 */
export interface ToastActions {
  addToast: (message: ReactNode, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
  promise: <T>(
    promise: Promise<T>,
    options: PromiseToastOptions<T>
  ) => Promise<T>;
}

/**
 * Toast context value
 */
export interface ToastContextValue extends ToastState, ToastActions {}

/**
 * Toast provider props
 */
export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
  defaultPosition?: ToastPosition;
  reverseOrder?: boolean;
  gutter?: number;
  containerStyle?: React.CSSProperties;
  toastStyle?: React.CSSProperties;
}

/**
 * Toast container props
 */
export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Individual toast props
 */
export interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Position styles mapping
 */
export const POSITION_STYLES: Record<ToastPosition, React.CSSProperties> = {
  'top-left': { top: 0, left: 0 },
  'top-center': { top: 0, left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: 0, right: 0 },
  'bottom-left': { bottom: 0, left: 0 },
  'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 0, right: 0 },
};

/**
 * Default toast durations by type
 */
export const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

/**
 * Default position
 */
export const DEFAULT_POSITION: ToastPosition = 'bottom-right';

/**
 * Default max toasts
 */
export const DEFAULT_MAX_TOASTS = 10;

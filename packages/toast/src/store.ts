import type { ReactNode } from 'react';
import type {
  Toast,
  ToastOptions,
  ToastState,
  ToastActions,
  PromiseToastOptions,
  ToastPosition,
} from './types.js';
import {
  DEFAULT_MAX_TOASTS,
  DEFAULT_POSITION,
  DEFAULT_DURATIONS,
} from './types.js';

// Generate unique ID
let toastIdCounter = 0;
const generateId = (): string => `toast-${++toastIdCounter}-${Date.now()}`;

// Event emitter for store updates
type Listener = () => void;
const listeners = new Set<Listener>();

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

// Store state
const state: ToastState = {
  toasts: [],
  maxToasts: DEFAULT_MAX_TOASTS,
  defaultDuration: DEFAULT_DURATIONS.info,
  defaultPosition: DEFAULT_POSITION,
};

// Frame scheduling for progress updates.
//
// requestAnimationFrame is browser-only. Importing this store on a server (Next
// RSC, SSR, any Node context) must not throw, and a queued frame must not fire
// after the environment that owns it has gone away — which is exactly what
// happens when a test runner tears down jsdom with a frame still pending.
// So: schedule through a guarded helper, and remember how each handle was made
// so it can be cancelled with the matching API.
const FRAME_MS = 16;

type FrameHandle = { id: number; isRaf: boolean };

const scheduleFrame = (cb: () => void): FrameHandle =>
  typeof requestAnimationFrame === 'function'
    ? { id: requestAnimationFrame(cb), isRaf: true }
    : { id: setTimeout(cb, FRAME_MS) as unknown as number, isRaf: false };

const cancelFrame = (handle: FrameHandle): void => {
  if (handle.isRaf) {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(handle.id);
    return;
  }
  clearTimeout(handle.id as unknown as ReturnType<typeof setTimeout>);
};

let frame: FrameHandle | null = null;
let lastUpdateTime = Date.now();

// Auto-dismiss timers, tracked so they can be cleared on reset instead of
// firing into a torn-down environment.
const pendingDismissals = new Set<ReturnType<typeof setTimeout>>();

// Update toast progress
const updateProgress = (): void => {
  const now = Date.now();
  // deltaTime available for future use in smooth animations
  void (now - lastUpdateTime);
  lastUpdateTime = now;

  let hasActiveToasts = false;

  state.toasts = state.toasts.map((toast) => {
    if (toast.isPaused || toast.isExiting) {
      return toast;
    }

    const elapsed = now - toast.createdAt;
    const remaining = Math.max(0, toast.duration - elapsed);
    const progress = toast.duration > 0 ? (remaining / toast.duration) * 100 : 0;

    if (remaining <= 0 && toast.duration > 0) {
      // Auto-dismiss toast
      const timer = setTimeout(() => {
        pendingDismissals.delete(timer);
        actions.dismissToast(toast.id);
        toast.onAutoClose?.();
      }, 0);
      pendingDismissals.add(timer);
      return { ...toast, progress: 0 };
    }

    hasActiveToasts = true;
    return { ...toast, progress };
  });

  if (hasActiveToasts) {
    notifyListeners();
    frame = scheduleFrame(updateProgress);
  } else {
    frame = null;
  }
};

const startProgressLoop = (): void => {
  if (!frame) {
    lastUpdateTime = Date.now();
    frame = scheduleFrame(updateProgress);
  }
};

// Store actions
const actions: ToastActions = {
  addToast: (message: ReactNode, options: ToastOptions = {}): string => {
    const id = options.id || generateId();
    const type = options.type || 'info';
    const duration = options.duration ?? DEFAULT_DURATIONS[type] ?? 3000;
    const position = options.position || state.defaultPosition;

    const toast: Toast = {
      id,
      type,
      title: options.title,
      message,
      duration,
      position,
      createdAt: Date.now(),
      progress: 100,
      isPaused: false,
      isExiting: false,
      action: options.action,
      onDismiss: options.onDismiss,
      onAutoClose: options.onAutoClose,
    };

    // Remove oldest toast if at limit
    if (state.toasts.length >= state.maxToasts) {
      const oldestToast = state.toasts[0];
      if (oldestToast) {
        actions.dismissToast(oldestToast.id);
      }
    }

    state.toasts = [...state.toasts, toast];
    notifyListeners();

    if (duration > 0) {
      startProgressLoop();
    }

    return id;
  },

  removeToast: (id: string): void => {
    state.toasts = state.toasts.filter((t) => t.id !== id);
    notifyListeners();
  },

  updateToast: (id: string, updates: Partial<Toast>): void => {
    state.toasts = state.toasts.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    notifyListeners();
  },

  dismissToast: (id: string): void => {
    const toast = state.toasts.find((t) => t.id === id);
    if (!toast || toast.isExiting) return;

    toast.onDismiss?.();

    state.toasts = state.toasts.map((t) =>
      t.id === id ? { ...t, isExiting: true } : t
    );
    notifyListeners();

    // Remove after animation
    setTimeout(() => {
      actions.removeToast(id);
    }, 300);
  },

  dismissAll: (): void => {
    state.toasts.forEach((toast) => {
      toast.onDismiss?.();
    });

    state.toasts = state.toasts.map((t) => ({ ...t, isExiting: true }));
    notifyListeners();

    setTimeout(() => {
      state.toasts = [];
      notifyListeners();
    }, 300);
  },

  pauseToast: (id: string): void => {
    state.toasts = state.toasts.map((t) =>
      t.id === id ? { ...t, isPaused: true } : t
    );
    notifyListeners();
  },

  resumeToast: (id: string): void => {
    state.toasts = state.toasts.map((t) =>
      t.id === id
        ? { ...t, isPaused: false, createdAt: Date.now() - (t.duration * (100 - t.progress)) / 100 }
        : t
    );
    notifyListeners();
    startProgressLoop();
  },

  promise: async <T>(promise: Promise<T>, options: PromiseToastOptions<T>): Promise<T> => {
    const loadingMessage = typeof options.loading === 'string' ? options.loading : 'Loading...';
    
    const id = actions.addToast(loadingMessage, {
      type: 'info',
      duration: Infinity,
      position: options.position,
    });

    try {
      const data = await promise;
      const successMessage = typeof options.success === 'function' 
        ? options.success(data) 
        : options.success;
      
      actions.updateToast(id, {
        type: 'success',
        message: successMessage,
        duration: options.duration ?? 3000,
      });
      
      startProgressLoop();
      return data;
    } catch (error) {
      const errorMessage = typeof options.error === 'function'
        ? options.error(error as Error)
        : options.error;
      
      actions.updateToast(id, {
        type: 'error',
        message: errorMessage,
        duration: options.duration ?? 5000,
      });
      
      startProgressLoop();
      throw error;
    }
  },
};

// Hook to subscribe to store
export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Get current state snapshot
export const getState = (): ToastState => state;

// Get current actions
export const getActions = (): ToastActions => actions;

// Helper functions for common toast types
export const toast = {
  success: (message: ReactNode, options?: Omit<ToastOptions, 'type'>): string =>
    actions.addToast(message, { ...options, type: 'success' }),
  
  error: (message: ReactNode, options?: Omit<ToastOptions, 'type'>): string =>
    actions.addToast(message, { ...options, type: 'error' }),
  
  warning: (message: ReactNode, options?: Omit<ToastOptions, 'type'>): string =>
    actions.addToast(message, { ...options, type: 'warning' }),
  
  info: (message: ReactNode, options?: Omit<ToastOptions, 'type'>): string =>
    actions.addToast(message, { ...options, type: 'info' }),
  
  custom: (message: ReactNode, options?: ToastOptions): string =>
    actions.addToast(message, options),
  
  promise: actions.promise,
  dismiss: actions.dismissToast,
  dismissAll: actions.dismissAll,
};

// Configure default settings
export const configure = (config: {
  maxToasts?: number;
  defaultDuration?: number;
  defaultPosition?: ToastPosition;
}): void => {
  if (config.maxToasts !== undefined) state.maxToasts = config.maxToasts;
  if (config.defaultDuration !== undefined) state.defaultDuration = config.defaultDuration;
  if (config.defaultPosition !== undefined) state.defaultPosition = config.defaultPosition;
};

// Reset store state (for testing only)
export const __resetStore = (): void => {
  state.toasts = [];
  state.maxToasts = DEFAULT_MAX_TOASTS;
  state.defaultDuration = DEFAULT_DURATIONS.info;
  state.defaultPosition = DEFAULT_POSITION;
  toastIdCounter = 0;
  listeners.clear();
  if (frame !== null) {
    cancelFrame(frame);
    frame = null;
  }
  pendingDismissals.forEach(clearTimeout);
  pendingDismissals.clear();
};

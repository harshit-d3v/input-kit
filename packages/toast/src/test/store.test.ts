import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  subscribe,
  getState,
  getActions,
  toast,
  configure,
  __resetStore,
} from '../store.js';

describe('Toast Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    __resetStore();
    // Set default configuration
    configure({
      maxToasts: 10,
      defaultDuration: 3000,
      defaultPosition: 'bottom-right',
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('addToast', () => {
    it('should add a toast with default options', () => {
      const id = getActions().addToast('Test message');
      
      expect(id).toBeDefined();
      expect(getState().toasts).toHaveLength(1);
      expect(getState().toasts[0].message).toBe('Test message');
      expect(getState().toasts[0].type).toBe('info');
    });

    it('should add a toast with custom options', () => {
      const id = getActions().addToast('Test message', {
        type: 'success',
        title: 'Success!',
        duration: 5000,
        position: 'top-center',
      });

      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem).toBeDefined();
      expect(toastItem?.type).toBe('success');
      expect(toastItem?.title).toBe('Success!');
      expect(toastItem?.duration).toBe(5000);
      expect(toastItem?.position).toBe('top-center');
    });

    it('should respect max toasts limit', () => {
      configure({ maxToasts: 3 });

      const id1 = getActions().addToast('Message 1');
      getActions().addToast('Message 2');
      getActions().addToast('Message 3');
      
      // When adding 4th toast, the first one should be marked as exiting
      getActions().addToast('Message 4');

      // Should have 4 toasts (3 active + 1 exiting)
      expect(getState().toasts).toHaveLength(4);
      // The first toast should be marked as exiting
      expect(getState().toasts.find(t => t.id === id1)?.isExiting).toBe(true);
    });
  });

  describe('toast helper', () => {
    it('should create success toast', () => {
      const id = toast.success('Success message');
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.type).toBe('success');
    });

    it('should create error toast', () => {
      const id = toast.error('Error message');
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.type).toBe('error');
    });

    it('should create warning toast', () => {
      const id = toast.warning('Warning message');
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.type).toBe('warning');
    });

    it('should create info toast', () => {
      const id = toast.info('Info message');
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.type).toBe('info');
    });
  });

  describe('dismissToast', () => {
    it('should mark toast as exiting when dismissed', () => {
      const id = getActions().addToast('Test message');
      
      getActions().dismissToast(id);
      
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.isExiting).toBe(true);
    });

    it('should call onDismiss callback', () => {
      const onDismiss = vi.fn();
      const id = getActions().addToast('Test message', { onDismiss });
      
      getActions().dismissToast(id);
      
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('dismissAll', () => {
    it('should mark all toasts as exiting', () => {
      getActions().addToast('Message 1');
      getActions().addToast('Message 2');
      getActions().addToast('Message 3');

      getActions().dismissAll();

      expect(getState().toasts.every((t) => t.isExiting)).toBe(true);
    });
  });

  describe('pauseToast', () => {
    it('should pause toast progress', () => {
      const id = getActions().addToast('Test message', { duration: 5000 });
      
      getActions().pauseToast(id);
      
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.isPaused).toBe(true);
    });
  });

  describe('resumeToast', () => {
    it('should resume toast progress', () => {
      const id = getActions().addToast('Test message', { duration: 5000 });
      
      getActions().pauseToast(id);
      getActions().resumeToast(id);
      
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.isPaused).toBe(false);
    });
  });

  describe('updateToast', () => {
    it('should update toast properties', () => {
      const id = getActions().addToast('Test message');
      
      getActions().updateToast(id, { title: 'Updated Title' });
      
      const toastItem = getState().toasts.find((t) => t.id === id);
      expect(toastItem?.title).toBe('Updated Title');
    });
  });

  describe('promise toast', () => {
    it('should handle successful promise', async () => {
      const promise = Promise.resolve('data');
      
      const result = await toast.promise(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      });

      expect(result).toBe('data');
    });

    it('should handle rejected promise', async () => {
      const promise = Promise.reject(new Error('Failed'));
      
      await expect(
        toast.promise(promise, {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error!',
        })
      ).rejects.toThrow('Failed');
    });

    it('should support function for success message', async () => {
      const promise = Promise.resolve({ name: 'John' });
      
      await toast.promise(promise, {
        loading: 'Loading...',
        success: (data) => `Hello ${data.name}!`,
        error: 'Error!',
      });

      const toasts = getState().toasts;
      const successToast = toasts[toasts.length - 1];
      expect(successToast?.message).toBe('Hello John!');
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      getActions().addToast('Test message');

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it('should stop notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      unsubscribe();
      listener.mockClear();
      getActions().addToast('Test message');

      // Should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

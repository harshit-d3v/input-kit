import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, configure } from '../useToast.js';
import { getState, __resetStore } from '../store.js';

describe('useToast hook', () => {
  beforeEach(() => {
    __resetStore();
    configure({
      maxToasts: 10,
      defaultDuration: 3000,
      defaultPosition: 'bottom-right',
    });
  });

  it('should return toast methods', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.success).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.warning).toBeDefined();
    expect(result.current.info).toBeDefined();
    expect(result.current.custom).toBeDefined();
    expect(result.current.dismiss).toBeDefined();
    expect(result.current.dismissAll).toBeDefined();
    expect(result.current.promise).toBeDefined();
  });

  it('should create success toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Success!');
    });

    expect(getState().toasts).toHaveLength(1);
    expect(getState().toasts[0].type).toBe('success');
    expect(getState().toasts[0].message).toBe('Success!');
  });

  it('should create error toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Error!');
    });

    expect(getState().toasts[0].type).toBe('error');
  });

  it('should create warning toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.warning('Warning!');
    });

    expect(getState().toasts[0].type).toBe('warning');
  });

  it('should create info toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Info!');
    });

    expect(getState().toasts[0].type).toBe('info');
  });

  it('should dismiss toast', () => {
    const { result } = renderHook(() => useToast());

    let id: string;
    act(() => {
      id = result.current.info('Test');
    });

    act(() => {
      result.current.dismiss(id);
    });

    expect(getState().toasts[0].isExiting).toBe(true);
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Test 1');
      result.current.info('Test 2');
      result.current.info('Test 3');
    });

    act(() => {
      result.current.dismissAll();
    });

    expect(getState().toasts.every((t) => t.isExiting)).toBe(true);
  });

  it('should handle promise toast', async () => {
    const { result } = renderHook(() => useToast());

    const promise = Promise.resolve('data');

    let resolved: string;
    await act(async () => {
      resolved = await result.current.promise(promise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed!',
      });
    });

    expect(resolved!).toBe('data');
  });
});

// Also test the standalone toast object
describe('toast object', () => {
  beforeEach(() => {
    __resetStore();
  });

  it('should work outside of React components', () => {
    toast.success('Standalone success');

    expect(getState().toasts).toHaveLength(1);
    expect(getState().toasts[0].type).toBe('success');
  });
});

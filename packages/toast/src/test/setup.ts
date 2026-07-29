import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock requestAnimationFrame for Node.js environment
globalThis.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 16) as unknown as number;
});

globalThis.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Cleanup after each test
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

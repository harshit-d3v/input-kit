import { vi } from 'vitest';

/**
 * jsdom ships no canvas implementation, so `getContext('2d')` returns null and the
 * library correctly refuses to draw. That is the right runtime behaviour — it is why
 * calling this in a headless environment does not throw — but it means the tests
 * would assert against a library that has deliberately opted out.
 *
 * A minimal 2D context stub covering the calls the renderer actually makes lets the
 * behaviour under test run without pulling in the native `canvas` package.
 */
function createContextStub(): CanvasRenderingContext2D {
  const stub = {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    stroke: vi.fn(),
    lineWidth: 1,
    strokeStyle: '#000000',
  };
  return stub as unknown as CanvasRenderingContext2D;
}

HTMLCanvasElement.prototype.getContext = vi.fn(function (
  this: HTMLCanvasElement,
  contextId: string,
) {
  return contextId === '2d' ? createContextStub() : null;
}) as unknown as HTMLCanvasElement['getContext'];

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { confetti, fireConfetti, celebrate } from './index';

// The rAF stand-in has to be cancellable. It used to return a constant `1` and drop
// the timeout handle, so `cancelAnimationFrame` could not stop anything: the confetti
// loop kept scheduling frames past the end of the test and blew up against a
// torn-down environment, failing the run even though every assertion passed.
const pendingFrames = new Set<ReturnType<typeof setTimeout>>();

const installRafMock = () => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = setTimeout(() => {
      pendingFrames.delete(id);
      cb(Date.now());
    }, 16);
    pendingFrames.add(id);
    return id as unknown as number;
  });

  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((handle) => {
    const id = handle as unknown as ReturnType<typeof setTimeout>;
    clearTimeout(id);
    pendingFrames.delete(id);
  });
};

const drainFrames = () => {
  for (const id of pendingFrames) clearTimeout(id);
  pendingFrames.clear();
};

describe('confetti', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    installRafMock();
  });

  afterEach(() => {
    drainFrames();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('should create a canvas element', () => {
    confetti();
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.style.position).toBe('fixed');
  });

  it('should use default particle count', () => {
    confetti();
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should accept custom particle count', () => {
    confetti({ particleCount: 50 });
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should accept custom colors', () => {
    const colors = ['#ff0000', '#00ff00'];
    confetti({ colors });
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should accept custom origin', () => {
    confetti({ origin: { x: 0, y: 0.5 } });
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should accept custom spread', () => {
    confetti({ spread: 180 });
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should set correct canvas dimensions', () => {
    confetti();
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(window.innerWidth);
    expect(canvas.height).toBe(window.innerHeight);
  });
});

describe('fireConfetti', () => {
  // This block had no rAF stand-in and no teardown at all, so its bursts ran on the
  // real jsdom clock and kept animating after the suite finished.
  beforeEach(() => {
    document.body.replaceChildren();
    installRafMock();
  });

  afterEach(() => {
    drainFrames();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('should call confetti function', () => {
    fireConfetti();
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should pass options to confetti', () => {
    fireConfetti({ particleCount: 200 });
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});

describe('celebrate', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.useFakeTimers();
    installRafMock();
  });

  afterEach(() => {
    drainFrames();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('should create multiple confetti bursts', () => {
    celebrate();
    
    // Fast-forward timers
    vi.advanceTimersByTime(300);
    
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThan(0);
  });
});

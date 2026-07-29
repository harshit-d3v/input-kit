import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { confetti, fireConfetti, celebrate } from './index';

describe('confetti', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(cb, 16);
      return 1;
    });
  });

  afterEach(() => {
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
  beforeEach(() => {
    document.body.innerHTML = '';
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
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create multiple confetti bursts', () => {
    celebrate();
    
    // Fast-forward timers
    vi.advanceTimersByTime(300);
    
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThan(0);
  });
});

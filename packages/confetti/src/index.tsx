// @input-kit/confetti - Lightweight confetti effects

export interface ConfettiOptions {
  particleCount?: number;
  /** Launch angle in degrees. 0 = right, 90 = up, 180 = left, 270 = down. Default: 90 */
  angle?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  gravity?: number;
  drift?: number;
  ticks?: number;
}

interface Particle {
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  gravity: number;
  drift: number;
  ticks: number;
  tilt: number;
  tiltAngle: number;
  tiltAngleIncrement: number;
}

const defaultColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

/**
 * Fire a confetti burst. Returns a cancellation function.
 * Safe to call in SSR environments (no-ops when `document` is unavailable).
 */
export function confetti(options: ConfettiOptions = {}): (() => void) | undefined {
  if (typeof document === 'undefined' || !document.body) return undefined;

  const {
    particleCount = 100,
    angle = 90,
    spread = 360,
    origin = { x: 0.5, y: 0.5 },
    colors = defaultColors,
    gravity = 0.5,
    drift = 0,
    ticks = 200,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) {
    document.body.removeChild(canvas);
    return undefined;
  }
  // Rebind with explicit non-null type so TypeScript keeps the narrowing inside closures.
  const ctx: CanvasRenderingContext2D = rawCtx;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Particle[] = [];
  const launchRad = angle * (Math.PI / 180);
  const halfSpreadRad = (spread / 2) * (Math.PI / 180);

  for (let i = 0; i < particleCount; i++) {
    const particleAngle = launchRad + (Math.random() * 2 - 1) * halfSpreadRad;
    const speed = Math.random() * 10 + 5;

    particles.push({
      x: origin.x * canvas.width,
      y: origin.y * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: Math.cos(particleAngle) * speed,
        y: -Math.sin(particleAngle) * speed,
      },
      gravity,
      drift,
      ticks,
      tilt: Math.random() * 10,
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.1 + 0.05,
    });
  }

  let animationId: number;
  const controller = new AbortController();

  function cleanup() {
    cancelAnimationFrame(animationId);
    controller.abort();
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  function update() {
    // Stop if the canvas has left the document — the page navigated, a host
    // component unmounted, or a test environment was torn down. Without this the
    // loop keeps scheduling frames and drawing into a canvas nobody can see, until
    // every particle happens to expire.
    if (!canvas.isConnected) {
      cleanup();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;

    for (const p of particles) {
      if (p.ticks > 0) {
        p.ticks--;
        p.x += p.velocity.x + p.drift;
        p.y += p.velocity.y;
        p.velocity.y += p.gravity;
        p.tiltAngle += p.tiltAngleIncrement;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt, p.y);
        ctx.lineTo(p.x, p.y + 10 + p.tilt);
        ctx.stroke();

        activeParticles++;
      }
    }

    if (activeParticles > 0) {
      animationId = requestAnimationFrame(update);
    } else {
      cleanup();
    }
  }

  // Auto-cancel when the tab is hidden; listener is removed via AbortController
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) cleanup();
    },
    { signal: controller.signal },
  );

  update();

  return cleanup;
}

/** Alias for `confetti`. Returns a cancellation function. */
export function fireConfetti(options: ConfettiOptions = {}): (() => void) | undefined {
  return confetti(options);
}

/** Multi-burst celebration: left cannon + right cannon + center burst. */
export function celebrate(): void {
  setTimeout(() => {
    confetti({ origin: { x: 0.1, y: 0.8 }, particleCount: 50, spread: 60, angle: 60 });
  }, 0);

  setTimeout(() => {
    confetti({ origin: { x: 0.9, y: 0.8 }, particleCount: 50, spread: 60, angle: 120 });
  }, 100);

  setTimeout(() => {
    confetti({ origin: { x: 0.5, y: 0.5 }, particleCount: 100, spread: 360 });
  }, 200);
}

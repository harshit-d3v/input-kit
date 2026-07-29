# @input-kit/confetti

Lightweight, zero-dependency confetti effect for the browser. Built with the Canvas API, fully typed, SSR-safe, and cancellable.

## Features

- Canvas-based particle renderer — no external dependencies
- Configurable launch angle, spread, gravity, drift, and particle count
- Built-in `celebrate()` multi-burst preset
- Returns a cancellation function to stop an in-flight animation
- Automatically cancels when the tab is hidden (via `visibilitychange`)
- SSR-safe — no-ops when `document` is unavailable
- Zero React required — works with any framework or plain HTML

## Installation

```bash
npm install @input-kit/confetti
```

## Quick Start

```ts
import { confetti, celebrate } from '@input-kit/confetti';

// Basic burst from center
confetti();

// Custom burst
confetti({
  particleCount: 150,
  angle: 90,
  spread: 60,
  origin: { x: 0.5, y: 0.8 },
  colors: ['#ff6b6b', '#feca57', '#48dbfb'],
  gravity: 0.6,
  ticks: 250,
});

// Built-in multi-burst celebration
celebrate();
```

### Cancel an animation

```ts
const stop = confetti({ particleCount: 500, ticks: 600 });
// Later:
stop?.();
```

## API

### `confetti(options?)`

Fires a confetti burst. Returns a cancellation function, or `undefined` in SSR environments.

```ts
function confetti(options?: ConfettiOptions): (() => void) | undefined
```

### `fireConfetti(options?)`

Alias for `confetti`.

### `celebrate()`

Fires three sequential bursts — left cannon, right cannon, center explosion — for a full-screen celebration effect.

```ts
function celebrate(): void
```

## ConfettiOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `particleCount` | `number` | `100` | Number of particles to spawn |
| `angle` | `number` | `90` | Launch direction in degrees. `0` = right, `90` = up, `180` = left, `270` = down |
| `spread` | `number` | `360` | Cone width in degrees centered on `angle`. `360` = all directions, `60` = narrow cone |
| `origin` | `{ x: number; y: number }` | `{ x: 0.5, y: 0.5 }` | Launch point as fraction of viewport. `(0, 0)` = top-left, `(1, 1)` = bottom-right |
| `colors` | `string[]` | 6-color rainbow | Array of CSS color strings for particle fill |
| `gravity` | `number` | `0.5` | Downward acceleration per frame. Higher = particles fall faster |
| `drift` | `number` | `0` | Horizontal drift per frame. Positive = right, negative = left |
| `ticks` | `number` | `200` | Lifetime of each particle in frames. Roughly `ticks / 60` seconds |

## Examples

### Fireworks effect

```ts
const end = Date.now() + 3000;

function frame() {
  confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
  confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
  if (Date.now() < end) requestAnimationFrame(frame);
}

frame();
```

### Custom color palette

```ts
confetti({
  particleCount: 200,
  colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
  spread: 180,
});
```

### React usage

```tsx
import { confetti, celebrate } from '@input-kit/confetti';

function SubmitButton() {
  const handleClick = () => {
    celebrate();
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

## TypeScript

All types are exported:

```ts
import type { ConfettiOptions } from '@input-kit/confetti';
```

## Browser Support

Requires Canvas 2D API — supported in all modern browsers. Not supported in Node.js / SSR (calls are silently no-ops).

## License

MIT © Harshit

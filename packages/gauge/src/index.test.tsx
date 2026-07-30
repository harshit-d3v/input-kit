import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Gauge,
  LinearGauge,
  SemiGauge,
  getColorForValue,
  describeArc,
  polarToCartesian,
} from './index';

const meterOf = (c: HTMLElement) => c.querySelector('[role="meter"]') as HTMLElement;
const fillOf = (c: HTMLElement) => meterOf(c).firstElementChild as HTMLElement;

describe('LinearGauge fill width', () => {
  // The headline defect: `percentage` is a 0-1 fraction, and the horizontal branch
  // interpolated it straight into a CSS percent, so a full gauge rendered 1% wide.
  it('fills to the value as a percentage, not as a fraction', () => {
    const { container } = render(<LinearGauge value={100} min={0} max={100} />);
    expect(fillOf(container).style.width).toBe('100%');
  });

  it.each([
    [0, '0%'],
    [25, '25%'],
    [50, '50%'],
    [100, '100%'],
  ])('value %i renders width %s', (value, expected) => {
    const { container } = render(<LinearGauge value={value} min={0} max={100} />);
    expect(fillOf(container).style.width).toBe(expected);
  });

  it('scales against a non 0-100 range', () => {
    const { container } = render(<LinearGauge value={150} min={100} max={200} />);
    expect(fillOf(container).style.width).toBe('50%');
  });

  it('clamps out-of-range values instead of overflowing', () => {
    const { container } = render(<LinearGauge value={500} min={0} max={100} />);
    expect(fillOf(container).style.width).toBe('100%');
  });

  it('vertical uses the same scale on height', () => {
    const { container } = render(<LinearGauge value={25} min={0} max={100} vertical />);
    expect(fillOf(container).style.height).toBe('25%');
  });

  it('does not produce NaN when max <= min', () => {
    const { container } = render(<LinearGauge value={5} min={10} max={10} />);
    expect(fillOf(container).style.width).toBe('0%');
  });
});

describe('accessible value', () => {
  it('LinearGauge exposes a meter with the real value and bounds', () => {
    const { container } = render(
      <LinearGauge value={42} min={0} max={200} label="CPU" />
    );
    const meter = meterOf(container);
    expect(meter.getAttribute('aria-valuenow')).toBe('42');
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('200');
    expect(meter.getAttribute('aria-label')).toBe('CPU');
  });

  it('reports the clamped value, not the raw one', () => {
    const { container } = render(<LinearGauge value={999} min={0} max={100} />);
    expect(meterOf(container).getAttribute('aria-valuenow')).toBe('100');
  });

  it('circular Gauge exposes a meter too', () => {
    const { container } = render(<Gauge value={30} min={0} max={100} />);
    expect(meterOf(container).getAttribute('aria-valuenow')).toBe('30');
  });
});

describe('describeArc', () => {
  // The path must be emitted start -> end so a stroke-dash animation fills from the
  // gauge minimum. It previously ran end -> start, which fills backwards.
  it('starts at the start angle', () => {
    const start = polarToCartesian(50, 50, 40, -90);
    const d = describeArc(50, 50, 40, -90, 90);
    expect(d.startsWith(`M ${start.x} ${start.y}`)).toBe(true);
  });

  it('uses the large-arc flag only past 180 degrees', () => {
    expect(describeArc(50, 50, 40, -90, 90).split(' ')[7]).toBe('0');
    expect(describeArc(50, 50, 40, -135, 135).split(' ')[7]).toBe('1');
  });
});

describe('getColorForValue', () => {
  const colors = [
    { value: 0, color: 'green' },
    { value: 50, color: 'yellow' },
    { value: 75, color: 'red' },
  ];

  it.each([
    [0, 'green'],
    [49, 'green'],
    [50, 'yellow'],
    [74, 'yellow'],
    [75, 'red'],
    [100, 'red'],
  ])('%i -> %s', (v, expected) => {
    expect(getColorForValue(v, colors)).toBe(expected);
  });

  it('falls back when no thresholds are given', () => {
    expect(getColorForValue(50, [])).toBe('#3b82f6');
  });

  it('is order-independent', () => {
    const shuffled = [colors[2], colors[0], colors[1]];
    expect(getColorForValue(60, shuffled)).toBe('yellow');
  });
});

describe('SemiGauge', () => {
  it('renders as a meter carrying the value', () => {
    const { container } = render(<SemiGauge value={10} min={0} max={20} />);
    expect(meterOf(container).getAttribute('aria-valuenow')).toBe('10');
  });
});

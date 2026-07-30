import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline, SparkBar, SparkArea, InlineSparkline } from './index';

const rects = (c: HTMLElement) => Array.from(c.querySelectorAll('rect')) as SVGRectElement[];
const h = (r: SVGRectElement) => Number(r.getAttribute('height'));

describe('SparkBar with negative values', () => {
  // Bar height used to be the value's normalised position across the whole range,
  // not its distance from zero — so for [-10, 0, 10] the zero bar rendered
  // half-height and the most-negative bar rendered nothing.
  it('gives the zero value no height', () => {
    const { container } = render(<SparkBar data={[-10, 0, 10]} width={120} height={40} />);
    const [neg, zero, pos] = rects(container);
    expect(h(zero)).toBeCloseTo(0, 1);
    expect(h(neg)).toBeGreaterThan(0);
    expect(h(pos)).toBeGreaterThan(0);
  });

  it('gives equal magnitudes equal heights', () => {
    const { container } = render(<SparkBar data={[-10, 10]} width={120} height={40} />);
    const [neg, pos] = rects(container);
    expect(h(neg)).toBeCloseTo(h(pos), 1);
  });

  it('scales heights in proportion to magnitude', () => {
    const { container } = render(<SparkBar data={[-10, -5, 5, 10]} width={200} height={40} />);
    const [ten, five] = rects(container);
    expect(h(ten)).toBeGreaterThan(h(five));
    expect(h(five)).toBeCloseTo(h(ten) / 2, 0);
  });

  it('draws a zero line only when negatives are present', () => {
    const withNeg = render(<SparkBar data={[-1, 1]} />).container;
    const withoutNeg = render(<SparkBar data={[1, 2]} />).container;
    expect(withNeg.querySelector('line')).toBeTruthy();
    expect(withoutNeg.querySelector('line')).toBeNull();
  });

  it('colours negatives differently', () => {
    const { container } = render(
      <SparkBar data={[-1, 1]} fill="blue" negativeFill="red" />
    );
    const [neg, pos] = rects(container);
    expect(neg.getAttribute('fill')).toBe('red');
    expect(pos.getAttribute('fill')).toBe('blue');
  });

  it('renders one bar per point, all positive', () => {
    const { container } = render(<SparkBar data={[1, 2, 3, 4]} />);
    expect(rects(container)).toHaveLength(4);
    expect(rects(container).every((r) => h(r) >= 0)).toBe(true);
  });
});

describe('SparkArea gradient id', () => {
  // Math.random() produced a different id on the server than on the client, so the
  // url(#id) reference broke hydration.
  it('is stable across re-renders of the same instance', () => {
    const { container, rerender } = render(<SparkArea data={[1, 2, 3]} gradient />);
    const first = container.querySelector('linearGradient')?.id;
    rerender(<SparkArea data={[1, 2, 4]} gradient />);
    expect(container.querySelector('linearGradient')?.id).toBe(first);
  });

  it('is unique between instances so two charts do not collide', () => {
    const a = render(<SparkArea data={[1, 2, 3]} gradient />).container;
    const b = render(<SparkArea data={[1, 2, 3]} gradient />).container;
    expect(a.querySelector('linearGradient')?.id).not.toBe(b.querySelector('linearGradient')?.id);
  });

  it('references its own gradient', () => {
    const { container } = render(<SparkArea data={[1, 2, 3]} gradient />);
    const id = container.querySelector('linearGradient')!.id;
    const filled = Array.from(container.querySelectorAll('path')).some((p) =>
      (p.getAttribute('fill') ?? '').includes(id)
    );
    expect(filled).toBe(true);
  });
});

describe('Sparkline', () => {
  it('renders nothing for empty data', () => {
    expect(render(<Sparkline data={[]} />).container.querySelector('svg')).toBeNull();
  });

  it('draws a path for real data', () => {
    const { container } = render(<Sparkline data={[1, 5, 2, 8]} />);
    const d = container.querySelector('path')?.getAttribute('d') ?? '';
    expect(d.length).toBeGreaterThan(0);
    expect(d).not.toContain('NaN');
  });

  it('survives a single point without NaN', () => {
    const d = render(<Sparkline data={[5]} />).container.querySelector('path')?.getAttribute('d') ?? '';
    expect(d).not.toContain('NaN');
  });

  it('survives a flat series without NaN', () => {
    const d = render(<Sparkline data={[3, 3, 3]} />).container.querySelector('path')?.getAttribute('d') ?? '';
    expect(d).not.toContain('NaN');
  });

  it('marks the min and max once each, not at every tie', () => {
    const { container } = render(
      <Sparkline data={[1, 1, 5, 1]} showMinMax minColor="red" maxColor="green" />
    );
    const circles = Array.from(container.querySelectorAll('circle'));
    expect(circles.filter((c) => c.getAttribute('fill') === 'red')).toHaveLength(1);
    expect(circles.filter((c) => c.getAttribute('fill') === 'green')).toHaveLength(1);
  });

  it('exposes a label as an accessible image', () => {
    const { container } = render(<Sparkline data={[1, 2]} label="Revenue" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Revenue');
  });

  it('honours limit by taking the most recent points', () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} limit={2} showDots />);
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });

  it('InlineSparkline renders inline', () => {
    const { container } = render(<InlineSparkline data={[1, 2, 3]} />);
    expect((container.querySelector('svg') as SVGElement).style.display).toBe('inline-block');
  });
});

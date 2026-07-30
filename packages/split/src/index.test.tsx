import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SplitPane, Pane, Split, CollapsibleSplit } from './index';

const panesOf = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('[data-pane="true"]')) as HTMLElement[];

describe('controlled sizes', () => {
  // The defect: the sync effect keyed on array identity, and the documented usage
  // passes an inline literal. New identity each render -> setState -> re-render ->
  // new identity, forever. React surfaces that as "Maximum update depth exceeded".
  it('settles when `sizes` is an inline array literal', () => {
    const onSizesChange = vi.fn();
    expect(() =>
      render(
        <SplitPane sizes={[30, 70]} onSizesChange={onSizesChange}>
          <div>left</div>
          <div>right</div>
        </SplitPane>
      )
    ).not.toThrow();

    // One application on mount is fine; a loop would be unbounded.
    expect(onSizesChange.mock.calls.length).toBeLessThan(5);
  });

  it('does not re-apply when the parent re-renders with an equal array', () => {
    const onSizesChange = vi.fn();

    function Harness() {
      const [, force] = useState(0);
      return (
        <>
          <button onClick={() => force((n) => n + 1)}>rerender</button>
          <SplitPane sizes={[40, 60]} onSizesChange={onSizesChange}>
            <div>a</div>
            <div>b</div>
          </SplitPane>
        </>
      );
    }

    render(<Harness />);
    const before = onSizesChange.mock.calls.length;
    fireEvent.click(screen.getByText('rerender'));
    fireEvent.click(screen.getByText('rerender'));
    expect(onSizesChange.mock.calls.length).toBe(before);
  });

  it('applies a genuinely changed array', () => {
    const onSizesChange = vi.fn();

    function Harness() {
      const [sizes, setSizes] = useState([50, 50]);
      return (
        <>
          <button onClick={() => setSizes([20, 80])}>shrink</button>
          <SplitPane sizes={sizes} onSizesChange={onSizesChange}>
            <div>a</div>
            <div>b</div>
          </SplitPane>
        </>
      );
    }

    render(<Harness />);
    onSizesChange.mockClear();
    fireEvent.click(screen.getByText('shrink'));
    expect(onSizesChange).toHaveBeenCalledWith([20, 80]);
  });
});

describe('pane sizing', () => {
  it('gives each pane its own flex basis', () => {
    const { container } = render(
      <SplitPane defaultSizes={[25, 75]}>
        <div>a</div>
        <div>b</div>
      </SplitPane>
    );
    const [first, second] = panesOf(container);
    expect(first.style.flex).toContain('25%');
    expect(second.style.flex).toContain('75%');
  });

  it('never emits calc(undefined%) when the child count grows', () => {
    function Harness() {
      const [n, setN] = useState(2);
      return (
        <>
          <button onClick={() => setN(3)}>add</button>
          <SplitPane>
            {Array.from({ length: n }, (_, i) => (
              <div key={i}>pane {i}</div>
            ))}
          </SplitPane>
        </>
      );
    }

    const { container } = render(<Harness />);
    fireEvent.click(screen.getByText('add'));
    for (const p of panesOf(container)) {
      expect(p.style.flex).not.toContain('undefined');
      expect(p.style.flex).not.toContain('NaN');
    }
  });

  it('Pane does not impose a size of its own', () => {
    // It used to probe the DOM for its index, always resolve to 0, claim sizes[0],
    // and then fight the wrapper's flex. Sizing belongs to the wrapper alone.
    const { container } = render(
      <SplitPane defaultSizes={[30, 70]}>
        <Pane>a</Pane>
        <Pane>b</Pane>
      </SplitPane>
    );
    const inner = container.querySelectorAll('[data-pane="true"] > div');
    inner.forEach((el) => {
      expect((el as HTMLElement).style.flex).toBe('');
    });
  });
});

describe('gutter', () => {
  it('is an accessible separator with bounds', () => {
    const { container } = render(
      <SplitPane defaultSizes={[40, 60]}>
        <div>a</div>
        <div>b</div>
      </SplitPane>
    );
    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    expect(sep).toBeTruthy();
    expect(sep.getAttribute('aria-valuenow')).toBe('40');
    expect(sep.tabIndex).toBe(0);
  });

  it('keeps a caller-supplied background through a hover cycle', () => {
    // Hover used to write currentTarget.style.background directly, permanently
    // clobbering a background passed in via `style`.
    const { container } = render(
      <SplitPane defaultSizes={[50, 50]}>
        <div>a</div>
        <div>b</div>
      </SplitPane>
    );
    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    const initial = sep.style.background;
    fireEvent.mouseEnter(sep);
    fireEvent.mouseLeave(sep);
    expect(sep.style.background).toBe(initial);
  });

  it('resizes with the arrow keys', () => {
    const onSizesChange = vi.fn();
    const { container } = render(
      <SplitPane defaultSizes={[50, 50]} keyboardStep={10} onSizesChange={onSizesChange}>
        <div>a</div>
        <div>b</div>
      </SplitPane>
    );
    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(onSizesChange).toHaveBeenCalledWith([60, 40]);
  });
});

describe('CollapsibleSplit', () => {
  it('tracks a `collapsed` prop that changes after mount', () => {
    function Harness() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <>
          <button onClick={() => setCollapsed(true)}>collapse</button>
          <CollapsibleSplit
            collapsed={collapsed}
            defaultSize={250}
            collapsedSize={0}
            first={<div>first</div>}
            second={<div>second</div>}
          />
        </>
      );
    }

    render(<Harness />);
    // The sized panel is the element wrapping `first`.
    const panel = () => screen.getByText('first').parentElement as HTMLElement;
    expect(panel().style.flex).toContain('250px');
    fireEvent.click(screen.getByText('collapse'));
    expect(panel().style.flex).toContain('0px');
  });
});

describe('Split', () => {
  it('lays the first pane out at defaultSize', () => {
    const { container } = render(
      <Split first={<div>a</div>} second={<div>b</div>} defaultSize={35} />
    );
    expect(panesOf(container)[0].style.flex).toContain('35%');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './index';

describe('Tooltip', () => {
  it('renders tooltip content on hover', () => {
    render(
      <Tooltip content="Helpful context" delay={0}>
        <button type="button">Trigger</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.getByRole('tooltip').textContent).toContain('Helpful context');
  });

  it('hides tooltip content on mouse leave', () => {
    render(
      <Tooltip content="Helpful context" delay={0} closeDelay={0}>
        <button type="button">Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);

    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
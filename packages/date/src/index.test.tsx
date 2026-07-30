import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  formatDate,
  parseDate,
  isSameDay,
  isSameMonth,
  getDaysInMonth,
  getFirstDayOfMonth,
  addMonths,
  addDays,
  Calendar,
} from './index';

describe('parseDate', () => {
  it('parses a well-formed date', () => {
    const d = parseDate('07/15/2026', 'MM/DD/YYYY');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(6);
    expect(d!.getDate()).toBe(15);
  });

  // The Date constructor rolls over silently, so this used to "succeed" and return a
  // real date in early 2027.
  it.each([
    ['13/45/2026', 'month and day both out of range'],
    ['13/01/2026', 'month 13'],
    ['00/10/2026', 'month 0'],
    ['02/30/2026', '30 February'],
    ['04/31/2026', '31 April'],
    ['01/32/2026', 'day 32'],
    ['01/00/2026', 'day 0'],
  ])('rejects %s (%s)', (input) => {
    expect(parseDate(input, 'MM/DD/YYYY')).toBeNull();
  });

  it('accepts 29 February in a leap year but not otherwise', () => {
    expect(parseDate('02/29/2024', 'MM/DD/YYYY')).not.toBeNull();
    expect(parseDate('02/29/2026', 'MM/DD/YYYY')).toBeNull();
  });

  it('returns null when the token count does not match', () => {
    expect(parseDate('2026', 'MM/DD/YYYY')).toBeNull();
  });
});

describe('formatDate', () => {
  const d = new Date(2026, 6, 5); // 5 July 2026

  it('pads month and day', () => {
    expect(formatDate(d, 'MM/DD/YYYY')).toBe('07/05/2026');
  });

  // `.replace(token, value)` with a string pattern only substitutes the first match.
  it('substitutes every occurrence of a token', () => {
    expect(formatDate(d, 'MM/DD/YYYY (MM)')).toBe('07/05/2026 (07)');
  });

  it('supports a two-digit year without eating the four-digit one', () => {
    expect(formatDate(d, 'YYYY-YY')).toBe('2026-26');
  });

  it('renders long and short month names', () => {
    expect(formatDate(d, 'MMMM', 'en-US')).toBe('July');
    expect(formatDate(d, 'MMM', 'en-US')).toBe('Jul');
  });

  it('round-trips through parseDate', () => {
    const s = formatDate(d, 'MM/DD/YYYY');
    expect(isSameDay(parseDate(s, 'MM/DD/YYYY')!, d)).toBe(true);
  });
});

describe('date helpers', () => {
  it('getDaysInMonth handles February', () => {
    expect(getDaysInMonth(new Date(2024, 1, 1))).toBe(29);
    expect(getDaysInMonth(new Date(2026, 1, 1))).toBe(28);
  });

  it('getFirstDayOfMonth returns the weekday index', () => {
    expect(getFirstDayOfMonth(new Date(2026, 6, 1))).toBe(new Date(2026, 6, 1).getDay());
  });

  it('addDays and addMonths do not mutate their argument', () => {
    const base = new Date(2026, 0, 15);
    addDays(base, 10);
    addMonths(base, 3);
    expect(base.getDate()).toBe(15);
    expect(base.getMonth()).toBe(0);
  });

  it('isSameMonth ignores the day', () => {
    expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 3, 30))).toBe(true);
    expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 4, 1))).toBe(false);
  });
});

describe('Calendar bounds', () => {
  // Cells are midnight, so a minDate carrying a time component used to compare
  // greater and disable its own day.
  it('does not disable the boundary day when minDate carries a time', () => {
    const day = new Date(2026, 6, 15);
    const minWithTime = new Date(2026, 6, 15, 14, 30);
    render(<Calendar month={day} minDate={minWithTime} />);
    const cell = screen.getByLabelText(/July 15, 2026/);
    expect(cell.getAttribute('aria-disabled')).toBeNull();
  });

  it('still disables the day before the bound', () => {
    render(<Calendar month={new Date(2026, 6, 15)} minDate={new Date(2026, 6, 15, 14, 30)} />);
    expect(screen.getByLabelText(/July 14, 2026/).getAttribute('aria-disabled')).toBe('true');
  });

  it('honours maxDate the same way', () => {
    render(<Calendar month={new Date(2026, 6, 15)} maxDate={new Date(2026, 6, 15, 1, 0)} />);
    expect(screen.getByLabelText(/July 15, 2026/).getAttribute('aria-disabled')).toBeNull();
    expect(screen.getByLabelText(/July 16, 2026/).getAttribute('aria-disabled')).toBe('true');
  });
});

describe('Calendar grid semantics', () => {
  it('is a grid of rows and gridcells', () => {
    const { container } = render(<Calendar month={new Date(2026, 6, 1)} />);
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="row"]').length).toBeGreaterThan(1);
    expect(container.querySelectorAll('[role="columnheader"]').length).toBe(7);
    expect(container.querySelectorAll('[role="gridcell"]').length % 7).toBe(0);
  });

  it('names the month navigation buttons', () => {
    render(<Calendar month={new Date(2026, 6, 1)} />);
    expect(screen.getByLabelText('Previous month')).toBeTruthy();
    expect(screen.getByLabelText('Next month')).toBeTruthy();
  });

  it('labels each day with a full date, not a bare number', () => {
    render(<Calendar month={new Date(2026, 6, 1)} />);
    expect(screen.getByLabelText(/July 4, 2026/)).toBeTruthy();
  });

  // Roving tabindex: the whole month used to be a flat run of tab stops.
  it('puts exactly one day in the tab order', () => {
    const { container } = render(<Calendar month={new Date(2026, 6, 1)} />);
    const tabbable = Array.from(container.querySelectorAll('[role="gridcell"] button')).filter(
      (b) => (b as HTMLButtonElement).tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
  });

  it('moves focus with the arrow keys', () => {
    render(<Calendar month={new Date(2026, 6, 1)} value={new Date(2026, 6, 15)} />);
    const start = screen.getByLabelText(/July 15, 2026/);
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByLabelText(/July 16, 2026/));

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByLabelText(/July 23, 2026/));

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(screen.getByLabelText(/July 16, 2026/));
  });

  it('keeps out-of-range days focusable so navigation can cross them', () => {
    // A natively disabled button cannot receive focus, which would stop arrow
    // navigation dead at the first unavailable day.
    render(<Calendar month={new Date(2026, 6, 15)} minDate={new Date(2026, 6, 10)} />);
    const blocked = screen.getByLabelText(/July 5, 2026/);
    expect(blocked.getAttribute('aria-disabled')).toBe('true');
    expect(blocked.hasAttribute('disabled')).toBe(false);
  });

  it('does not select a disabled day on click', () => {
    const onChange = vi.fn();
    render(
      <Calendar month={new Date(2026, 6, 15)} minDate={new Date(2026, 6, 10)} onChange={onChange} />
    );
    fireEvent.click(screen.getByLabelText(/July 5, 2026/));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/July 20, 2026/));
    expect(onChange).toHaveBeenCalled();
  });
});

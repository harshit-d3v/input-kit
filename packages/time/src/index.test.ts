import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatDuration, getTimeUnit, getTimeDiff, isToday } from './index';

const ago = (seconds: number) => new Date(Date.now() - seconds * 1000);

describe('formatRelativeTime', () => {
  it('says "just now" inside the threshold', () => {
    expect(formatRelativeTime(ago(2))).toMatch(/now/i);
  });

  it('reports minutes and hours', () => {
    expect(formatRelativeTime(ago(120))).toMatch(/2 minutes ago/);
    expect(formatRelativeTime(ago(7200))).toMatch(/2 hours ago/);
  });

  it('reports future times with a prefix', () => {
    expect(formatRelativeTime(new Date(Date.now() + 7200 * 1000))).toMatch(/in 2 hours/);
  });

  // The fallback floored, so a 30-second-old date with minUnit 'minute' reported 0.
  it('never reports zero of the minimum unit', () => {
    const out = formatRelativeTime(ago(30), { minUnit: 'minute' });
    expect(out).not.toMatch(/\b0\b/);
    expect(out).toMatch(/1 minute/);
  });

  // The unit was chosen by flooring and the value rounded independently, so 3599s
  // picked `minute` and rounded to 60.
  it('promotes the unit when rounding overflows it', () => {
    const out = formatRelativeTime(ago(3599), { round: true });
    expect(out).not.toMatch(/60 minutes/);
    expect(out).toMatch(/1 hour/);
  });

  it('respects maxUnit', () => {
    expect(formatRelativeTime(ago(86400 * 40), { maxUnit: 'day' })).toMatch(/days ago/);
  });

  it('omits the suffix when asked', () => {
    expect(formatRelativeTime(ago(120), { addSuffix: false })).not.toMatch(/ago/);
  });
});

describe('getTimeUnit', () => {
  it.each([
    [30, 'second'],
    [90, 'minute'],
    [3700, 'hour'],
    [90000, 'day'],
  ])('%i seconds -> %s', (secs, unit) => {
    expect(getTimeUnit(secs).unit).toBe(unit);
  });

  it('clamps to at least 1 of the smallest permitted unit', () => {
    expect(getTimeUnit(30, { minUnit: 'minute' }).value).toBe(1);
  });
});

describe('formatDuration', () => {
  it('formats a compound duration', () => {
    expect(formatDuration(3661)).toMatch(/1 hour/);
    expect(formatDuration(3661)).toMatch(/1 minute/);
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toMatch(/0/);
  });

  // Parts come from Intl.NumberFormat in the caller's locale, then used to be joined
  // with a hardcoded English ' and '.
  it('does not splice English conjunctions into a French duration', () => {
    const out = formatDuration(3661, { locale: 'fr' });
    expect(out).not.toMatch(/\band\b/);
  });

  it('uses the locale for the parts themselves', () => {
    expect(formatDuration(7200, { locale: 'fr' })).toMatch(/heure/);
  });

  it('narrow style stays compact', () => {
    expect(formatDuration(3661, { style: 'narrow' })).not.toMatch(/\band\b/);
  });
});

describe('getTimeDiff / isToday', () => {
  it('is negative for the past and positive for the future', () => {
    expect(getTimeDiff(ago(60))).toBeLessThan(0);
    expect(getTimeDiff(new Date(Date.now() + 60000))).toBeGreaterThan(0);
  });

  it('recognises today', () => {
    expect(isToday(new Date())).toBe(true);
    expect(isToday(new Date(Date.now() - 86400 * 2 * 1000))).toBe(false);
  });
});

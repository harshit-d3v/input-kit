import React from 'react';
import { Countdown, RelativeTime, Stopwatch, TimeAgo, formatWithContext } from '../src/index';

export function Demo() {
  const now = Date.now();
  const events = [
    { label: 'Deploy finished', date: now - 4 * 60 * 1000 },
    { label: 'Billing sync', date: now - 2 * 60 * 60 * 1000 },
    { label: 'Weekly digest', date: now + 26 * 60 * 60 * 1000 },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <h1>@input-kit/time</h1>
      <p>Locale-aware relative time, contextual formatting, countdowns, and stopwatch utilities.</p>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Relative Time</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {events.map((event) => (
            <div key={event.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: '0.875rem' }}>
              <span>{event.label}</span>
              <TimeAgo date={event.date} locale="en-GB" formatStyle="short" />
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Locale And Context</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div>English: <RelativeTime date={now - 90 * 1000} locale="en-US" formatStyle="long" /></div>
          <div>French: <RelativeTime date={now - 90 * 1000} locale="fr-FR" formatStyle="long" /></div>
          <div>Compact: <RelativeTime date={now + 5 * 60 * 1000} locale="de-DE" formatStyle="narrow" /></div>
          <div>Context label: {formatWithContext(now + 24 * 60 * 60 * 1000, { locale: 'en-US' })}</div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Countdown</h2>
          <Countdown targetDate={now + 3 * 24 * 60 * 60 * 1000 + 90 * 1000} format="compact" />
        </div>
        <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Stopwatch Render Prop</h2>
          <Stopwatch>
            {({ formatted, start, stop, reset, isRunning }) => (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <strong style={{ fontSize: '1.5rem' }}>{formatted}</strong>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={start} disabled={isRunning}>Start</button>
                  <button type="button" onClick={stop} disabled={!isRunning}>Stop</button>
                  <button type="button" onClick={reset}>Reset</button>
                </div>
              </div>
            )}
          </Stopwatch>
        </div>
      </section>
    </div>
  );
}

export default Demo;

import React, { useState } from 'react';
import { Tooltip } from '../src/index';

const buttonStyle: React.CSSProperties = {
  border: '1px solid rgba(148,163,184,0.3)',
  background: 'rgba(255,255,255,0.72)',
  color: '#0f172a',
  borderRadius: 999,
  padding: '12px 18px',
  fontSize: 14,
  cursor: 'pointer',
  backdropFilter: 'blur(18px)',
};

function PlacementCloud() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Tooltip
          key={placement}
          placement={placement}
          content={`Smart positioning starts at ${placement}. Resize the window to see collision handling.`}
        >
          <button style={buttonStyle}>{placement.toUpperCase()}</button>
        </Tooltip>
      ))}
    </div>
  );
}

function InteractiveStudio() {
  const [isPinned, setIsPinned] = useState(false);

  return (
    <Tooltip
      interactive
      open={isPinned ? true : undefined}
      onOpenChange={setIsPinned}
      placement="right"
      content={
        <div style={{ display: 'grid', gap: 12, maxWidth: 240 }}>
          <strong style={{ fontSize: 14 }}>Review quick actions</strong>
          <span style={{ fontSize: 13, color: '#cbd5e1' }}>
            Interactive tooltips stay open while you move into the surface, and close on Escape or outside click.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setIsPinned(false)}
              style={{ ...buttonStyle, background: '#e2e8f0', color: '#0f172a', padding: '8px 12px' }}
            >
              Close
            </button>
            <button
              onClick={() => window.alert('Draft shared')}
              style={{ ...buttonStyle, background: '#38bdf8', color: '#082f49', padding: '8px 12px' }}
            >
              Share Draft
            </button>
          </div>
        </div>
      }
    >
      <button style={{ ...buttonStyle, background: '#0f172a', color: '#f8fafc' }}>Hover or focus me</button>
    </Tooltip>
  );
}

export function Demo() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '48px 20px 72px',
        background:
          'radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(251,146,60,0.16), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #ecfeff 100%)',
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        color: '#0f172a',
      }}
    >
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0f766e' }}>
            Input Kit Tooltip
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 5vw, 4.1rem)', lineHeight: 0.95 }}>
            Tooltips that behave like real product surfaces instead of absolute-positioned afterthoughts.
          </h1>
          <p style={{ maxWidth: 720, margin: 0, color: '#334155', fontSize: 18, lineHeight: 1.6 }}>
            The package now supports collision-aware positioning, interactive content, Escape dismissal, controlled state, and custom styling without needing a separate positioning library.
          </p>
        </header>

        <section
          style={{
            background: 'rgba(255,255,255,0.78)',
            borderRadius: 28,
            border: '1px solid rgba(148,163,184,0.18)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
            padding: 28,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Placement playground</h2>
          <PlacementCloud />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          <article style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 24, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Interactive content</h2>
            <p style={{ lineHeight: 1.6, color: '#cbd5e1' }}>
              Great for teaching surfaces, quick actions, and product tours that need to remain reachable instead of vanishing the moment the cursor moves.
            </p>
            <InteractiveStudio />
          </article>

          <article style={{ background: '#ffffff', borderRadius: 24, padding: 24, border: '1px solid rgba(148,163,184,0.18)' }}>
            <h2 style={{ marginTop: 0 }}>Custom tone</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Tooltip
                placement="bottom"
                content="Breezy editorial styling for polished marketing UI."
                style={{ background: '#f97316', color: '#431407', fontWeight: 600 }}
              >
                <button style={buttonStyle}>Editorial</button>
              </Tooltip>
              <Tooltip
                placement="bottom"
                content="Works well for dashboards and command surfaces."
                style={{ background: '#111827', color: '#f9fafb' }}
              >
                <button style={buttonStyle}>Command</button>
              </Tooltip>
              <Tooltip
                placement="bottom"
                content="Subtle utility tone for low-friction helper text."
                style={{ background: '#ecfeff', color: '#155e75', border: '1px solid rgba(34,211,238,0.4)' }}
              >
                <button style={buttonStyle}>Utility</button>
              </Tooltip>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default Demo;

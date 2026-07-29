import React from 'react';
import { ToastProvider, ToastContainer, useToast, toast } from '../src/index';

const surfaceStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  borderRadius: 24,
  padding: 24,
  border: '1px solid rgba(148,163,184,0.18)',
  boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
};

function Showcase() {
  const notifier = useToast();

  const runPromiseFlow = () => {
    notifier.promise(
      new Promise<string>((resolve, reject) => {
        window.setTimeout(() => {
          if (Math.random() > 0.35) {
            resolve('Deployment artifacts uploaded.');
          } else {
            reject(new Error('CDN cache warmup failed.'));
          }
        }, 1400);
      }),
      {
        loading: 'Uploading release bundle…',
        success: (message) => message,
        error: (error) => error.message,
      }
    );
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 24 }}>
      <header style={{ display: 'grid', gap: 10 }}>
        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#1d4ed8' }}>
          Input Kit Toast
        </span>
        <h1 style={{ margin: 0, fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 0.96 }}>
          Headless toasts with the ergonomics of a polished product ops console.
        </h1>
        <p style={{ maxWidth: 720, margin: 0, color: '#334155', fontSize: 18, lineHeight: 1.6 }}>
          The API stays minimal: typed toast helpers, promise states, action buttons, swipe dismissal, and live-region behavior tuned by severity.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        <article style={surfaceStyle}>
          <h2 style={{ marginTop: 0 }}>Severity triggers</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#16a34a', color: '#f8fafc', cursor: 'pointer' }} onClick={() => notifier.success('Release shipped cleanly.', { title: 'Success' })}>Success</button>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#2563eb', color: '#f8fafc', cursor: 'pointer' }} onClick={() => notifier.info('Analytics import queued for 09:15.', { title: 'Heads up' })}>Info</button>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#f59e0b', color: '#111827', cursor: 'pointer' }} onClick={() => notifier.warning('Traffic spike detected in Europe west.', { title: 'Watchlist' })}>Warning</button>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#dc2626', color: '#f8fafc', cursor: 'pointer' }} onClick={() => notifier.error('Payment provider timeout while retrying capture.', { title: 'Action needed' })}>Error</button>
          </div>
        </article>

        <article style={surfaceStyle}>
          <h2 style={{ marginTop: 0 }}>Action patterns</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <button
              style={{ padding: '12px 14px', borderRadius: 16, border: 'none', background: '#0f172a', color: '#f8fafc', cursor: 'pointer' }}
              onClick={() =>
                toast.info('Draft deleted.', {
                  title: 'Content operation',
                  action: {
                    label: 'Undo',
                    onClick: () => toast.success('Draft restored.'),
                  },
                })
              }
            >
              Fire undo toast
            </button>
            <button
              style={{ padding: '12px 14px', borderRadius: 16, border: 'none', background: '#e2e8f0', color: '#0f172a', cursor: 'pointer' }}
              onClick={() => notifier.dismissAll()}
            >
              Clear every toast
            </button>
          </div>
        </article>

        <article style={surfaceStyle}>
          <h2 style={{ marginTop: 0 }}>Promise pipeline</h2>
          <button
            style={{ padding: '12px 14px', borderRadius: 16, border: 'none', background: '#38bdf8', color: '#082f49', cursor: 'pointer' }}
            onClick={runPromiseFlow}
          >
            Simulate release workflow
          </button>
        </article>
      </section>

      <ToastContainer gutter={12} />
    </div>
  );
}

export function DemoApp() {
  return (
    <ToastProvider>
      <div
        style={{
          minHeight: '100vh',
          padding: '48px 20px 72px',
          background:
            'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(14,165,233,0.16), transparent 24%), linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          fontFamily: 'Segoe UI, Tahoma, sans-serif',
          color: '#0f172a',
        }}
      >
        <Showcase />
      </div>
    </ToastProvider>
  );
}

export default DemoApp;

import React, { useState } from 'react';
import { CollapsibleSplit, Split, SplitPane } from '../src/index';

function PanelCard({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ height: '100%', padding: '1.25rem', background: '#ffffff', borderRadius: '1rem', border: `1px solid ${accent}`, overflow: 'auto' }}>
      <h3 style={{ marginBottom: '0.75rem', color: accent }}>{title}</h3>
      <div style={{ color: '#475569', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export function Demo() {
  const [layout, setLayout] = useState([34, 66]);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <h1>@input-kit/split</h1>
      <p>Resizable panel layouts with drag, keyboard resizing, and quick reset on double-click.</p>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Controlled SplitPane</h2>
        <p style={{ marginBottom: '1rem', color: '#475569' }}>Drag the separator, use arrow keys when focused, or double-click to rebalance.</p>
        <div style={{ marginBottom: '1rem', fontWeight: 600 }}>Layout: {layout[0].toFixed(0)} / {layout[1].toFixed(0)}</div>
        <div style={{ height: 280, background: '#f8fafc', padding: '0.75rem', borderRadius: '1rem' }}>
          <SplitPane
            sizes={layout}
            onSizesChange={setLayout}
            minSizes={[20, 20]}
            keyboardStep={4}
            gutterSize={10}
          >
            <PanelCard title="Inspector" accent="#2563eb">
              The left panel is constrained to at least 20% width and updates external state as the layout changes.
            </PanelCard>
            <PanelCard title="Preview" accent="#0f766e">
              The separator is keyboard accessible and exposes separator ARIA values for assistive technologies.
            </PanelCard>
          </SplitPane>
        </div>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Two-Pane Shortcut</h2>
        <div style={{ height: 240, background: '#f8fafc', padding: '0.75rem', borderRadius: '1rem' }}>
          <Split
            direction="vertical"
            defaultSize={58}
            minSize={20}
            first={<PanelCard title="Console" accent="#7c3aed">Use this shortcut for quick stacked layouts without manually wiring sizes arrays.</PanelCard>}
            second={<PanelCard title="Logs" accent="#ea580c">It is useful for editor + output, chart + table, or master/detail screens.</PanelCard>}
          />
        </div>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Collapsible Layout</h2>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          style={{ marginBottom: '1rem', padding: '0.625rem 0.9rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
        >
          {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </button>
        <div style={{ height: 220, background: '#f8fafc', padding: '0.75rem', borderRadius: '1rem' }}>
          <CollapsibleSplit
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            first={<PanelCard title="Sidebar" accent="#db2777">Filter groups, saved searches, and quick actions can live here.</PanelCard>}
            second={<PanelCard title="Content" accent="#0891b2">The main workspace stays visible while the first pane collapses to zero width.</PanelCard>}
          />
        </div>
      </section>
    </div>
  );
}

export default Demo;

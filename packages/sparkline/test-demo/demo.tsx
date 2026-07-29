import React, { useEffect } from 'react';
import {
  SparkArea,
  SparkBar,
  Sparkline,
  SparklineWithReference,
  useSparklineData,
} from '../src/index';

export function Demo() {
  const { data, addPoint, stats } = useSparklineData([18, 24, 21, 31, 29, 35, 32, 40]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const last = data[data.length - 1] ?? 24;
      const next = Math.max(8, Math.min(48, Math.round(last + (Math.random() * 10 - 5))));
      addPoint(next, 20);
    }, 1600);

    return () => window.clearInterval(timer);
  }, [addPoint, data]);

  return (
    <div style={{ padding: '2rem', maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <h1>@input-kit/sparkline</h1>
      <p>Compact SVG charts for dashboards, tables, and inline status indicators.</p>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem', display: 'grid', gap: '1rem' }}>
        <h2>Live Trend</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Latest</div>
            <strong>{stats.last}</strong>
          </div>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Average</div>
            <strong>{stats.avg.toFixed(1)}</strong>
          </div>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Min</div>
            <strong>{stats.min}</strong>
          </div>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Max</div>
            <strong>{stats.max}</strong>
          </div>
        </div>
        <SparkArea
          data={data}
          width={820}
          height={160}
          stroke="#0f172a"
          gradientFrom="#38bdf8"
          gradientTo="#ffffff"
          showEndDot
          animated
          label="Live throughput trend"
        />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Reference Line</h2>
          <SparklineWithReference
            data={[12, 18, 22, 20, 28, 32, 26, 34, 36]}
            referenceValue={24}
            width={360}
            height={120}
            stroke="#16a34a"
            showDots
            showMinMax
            label="Weekly conversions against target"
          />
        </div>
        <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Spark Bars</h2>
          <SparkBar
            data={[14, -6, 18, 22, -3, 30, 26, -8, 35]}
            width={360}
            height={120}
            fill="#2563eb"
            negativeFill="#ef4444"
            animated
            label="Net gain by interval"
          />
        </div>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Compact Inline Usage</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>Revenue:</span>
          <Sparkline data={[4, 8, 6, 12, 16, 14, 18]} width={120} height={36} stroke="#7c3aed" showEndDot label="Revenue sparkline" />
          <span style={{ color: '#16a34a', fontWeight: 700 }}>+18%</span>
        </div>
      </section>
    </div>
  );
}

export default Demo;

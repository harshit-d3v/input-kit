import React, { useState } from 'react';
import { LineChart, BarChart, PieChart, type ChartSeries } from '../src/index';

const section: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};
const note: React.CSSProperties = { fontSize: '13px', color: '#6b7280' };

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const revenue = [12, 19, 15, 27, 22, 31];
const costs = [8, 11, 13, 16, 14, 19];

const asPoints = (values: number[]) =>
  values.map((y, i) => ({ x: months[i], y }));

const series: ChartSeries[] = [
  { name: 'Revenue', data: asPoints(revenue) },
  { name: 'Costs', data: asPoints(costs) },
];

// ─── 1. Line chart ────────────────────────────────────────────────────────────
function LineExample() {
  const [curved, setCurved] = useState(true);
  const [fill, setFill] = useState(false);
  const [dots, setDots] = useState(true);

  const toggle = (text: string, checked: boolean, set: (v: boolean) => void) => (
    <label style={{ fontSize: '13px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} />
      {text}
    </label>
  );

  return (
    <div style={section}>
      <h2>Line chart</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {toggle('curved', curved, setCurved)}
        {toggle('fill', fill, setFill)}
        {toggle('dots', dots, setDots)}
      </div>
      <LineChart data={series} width={640} height={320} curved={curved} fill={fill} showDots={dots} />
      <p style={note}>
        Both series share one x axis taken from the longest of them, so they line up
        with each other and with the labels.
      </p>
    </div>
  );
}

// ─── 2. Bar chart ─────────────────────────────────────────────────────────────
function BarExample() {
  return (
    <div style={section}>
      <h2>Bar chart</h2>
      <BarChart data={asPoints(revenue)} width={640} height={300} />
    </div>
  );
}

// ─── 3. Pie chart ─────────────────────────────────────────────────────────────
function PieExample() {
  const [donut, setDonut] = useState(false);
  const slices = [
    { label: 'Direct', value: 42 },
    { label: 'Search', value: 27 },
    { label: 'Referral', value: 18 },
    { label: 'Social', value: 13 },
  ];

  return (
    <div style={section}>
      <h2>Pie chart</h2>
      <label style={{ fontSize: '13px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
        <input type="checkbox" checked={donut} onChange={(e) => setDonut(e.target.checked)} />
        donut
      </label>
      <div style={{ marginTop: '1rem' }}>
        <PieChart data={slices} width={420} height={320} innerRadius={donut ? 70 : 0} showLegend showLabels />
      </div>
    </div>
  );
}

// ─── 4. Awkward data ──────────────────────────────────────────────────────────
function EdgeCasesExample() {
  const cases: Array<{ title: string; data: number[]; why: string }> = [
    { title: 'Single point', data: [42], why: 'centred rather than dividing by zero' },
    { title: 'Flat series', data: [7, 7, 7, 7], why: 'zero span does not become NaN' },
    { title: 'All negative', data: [-5, -12, -8, -20], why: 'axis headroom extends the right way' },
    { title: 'Crossing zero', data: [-8, 4, -2, 10], why: 'baseline sits inside the range' },
  ];

  return (
    <div style={section}>
      <h2>Awkward data</h2>
      <p style={note}>Shapes that used to produce empty or clipped charts.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {cases.map(({ title, data, why }) => (
          <div key={title}>
            <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>{title}</h3>
            <LineChart data={asPoints(data.map((v) => v)).map((p, i) => ({ ...p, x: String(i) }))} width={280} height={180} />
            <p style={note}>{why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>@input-kit/chart</h1>
      <p>Lightweight SVG line, bar and pie charts with no charting dependency.</p>
      <LineExample />
      <BarExample />
      <PieExample />
      <EdgeCasesExample />
    </div>
  );
}

export default Demo;

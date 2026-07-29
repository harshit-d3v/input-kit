import React from 'react';
import {
  Timeline,
  TimelineGroup,
  TimelineItem,
  TimelineSeparator,
  type TimelineEvent,
} from '../src/index';

const launchTimeline: TimelineEvent[] = [
  {
    id: 'brief',
    title: 'Creative Brief Locked',
    description: 'Positioning, tone, and launch narrative aligned with design and growth.',
    date: '2026-04-02',
    status: 'completed',
    color: '#0f766e',
  },
  {
    id: 'beta',
    title: 'Private Beta Window',
    description: 'Invite-only rollout with telemetry, customer interviews, and rapid fixes.',
    date: '2026-04-08',
    status: 'current',
    color: '#2563eb',
  },
  {
    id: 'press',
    title: 'Press Kit Ready',
    description: 'Brand assets, one-pager, and launch video cut for partners and media.',
    date: '2026-04-15',
    status: 'pending',
    color: '#7c3aed',
  },
  {
    id: 'public',
    title: 'Public Release',
    description: 'General availability with onboarding flows, docs, and migration support.',
    date: '2026-04-22',
    status: 'pending',
    color: '#ea580c',
  },
];

const interviewLoop: TimelineEvent[] = [
  {
    id: 'screen',
    title: 'Intro Screen',
    description: 'Align on scope, constraints, and product sense.',
    status: 'completed',
    date: '2026-04-01',
  },
  {
    id: 'workshop',
    title: 'Systems Workshop',
    description: 'Collaborative whiteboard with architecture trade-offs and API choices.',
    status: 'completed',
    date: '2026-04-03',
  },
  {
    id: 'onsite',
    title: 'Onsite Sprint',
    description: 'Hands-on implementation, accessibility review, and pair-debugging.',
    status: 'current',
    date: '2026-04-08',
  },
];

const sectionStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  border: '1px solid rgba(148,163,184,0.22)',
  borderRadius: 24,
  padding: 28,
  boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
  backdropFilter: 'blur(18px)',
};

export function Demo() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '48px 20px 80px',
        background:
          'radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 32%), radial-gradient(circle at top right, rgba(249,115,22,0.16), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        color: '#0f172a',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'grid', gap: 12 }}>
          <span style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#475569' }}>
            Input Kit Timeline
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', lineHeight: 0.95 }}>
            Narrative timelines that feel like product storytelling, not a bulleted checklist.
          </h1>
          <p style={{ maxWidth: 720, margin: 0, fontSize: 18, color: '#334155', lineHeight: 1.6 }}>
            Click any milestone to make it active. The alternating layout, grouped sections, and custom timeline items all use the package primitives directly.
          </p>
        </header>

        <section style={sectionStyle}>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>Alternating launch roadmap</h2>
          <Timeline events={launchTimeline} position="alternate" lineColor="#cbd5e1" />
        </section>

        <section style={sectionStyle}>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>Grouped hiring journey</h2>
          <Timeline position="center" lineColor="#dbeafe">
            <TimelineGroup title="Candidate Loop" events={interviewLoop} />
            <TimelineSeparator label="Decision Day" />
            <TimelineItem
              id="offer"
              title="Offer Sent"
              description="Compensation, growth plan, and first 30-day roadmap shared with the candidate."
              date="2026-04-10"
              status="pending"
              color="#8b5cf6"
            />
            <TimelineItem
              id="start"
              title="Kickoff Monday"
              description="Workspace setup, product tour, and first-pairing session queued up."
              date="2026-04-14"
              status="pending"
              color="#14b8a6"
            />
          </Timeline>
        </section>

        <section style={{ ...sectionStyle, overflow: 'hidden' }}>
          <h2 style={{ marginTop: 0, fontSize: 28 }}>Horizontal release phases</h2>
          <Timeline orientation="horizontal" lineColor="#e2e8f0">
            {['Concept', 'Prototype', 'Beta', 'Launch'].map((phase, index) => (
              <TimelineItem
                key={phase}
                id={phase.toLowerCase()}
                index={index}
                title={phase}
                description={
                  index === 0
                    ? 'Explore the shape of the feature.'
                    : index === 1
                    ? 'Validate with internal teams.'
                    : index === 2
                    ? 'Pressure-test with pilot users.'
                    : 'Ship with docs and support.'
                }
                status={index < 2 ? 'completed' : index === 2 ? 'current' : 'pending'}
                date={`Week ${index + 1}`}
              />
            ))}
          </Timeline>
        </section>
      </div>
    </div>
  );
}

export default Demo;

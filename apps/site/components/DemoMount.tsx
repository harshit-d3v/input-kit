'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { demos } from '../lib/demos';

/**
 * A demo is arbitrary third-party-ish code running in the page. One that throws
 * should degrade to a message in its own frame, not blank the whole route.
 */
class DemoBoundary extends Component<{ slug: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[input-kit] demo "${this.props.slug}" threw`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="demo-loading" role="alert">
          This demo failed to render: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export function DemoMount({ slug }: { slug: string }) {
  const Demo = demos[slug];

  if (!Demo) {
    return (
      <div className="demo-loading" role="status">
        No demo is wired up for this package yet.
      </div>
    );
  }

  return (
    <DemoBoundary slug={slug}>
      <Demo />
    </DemoBoundary>
  );
}

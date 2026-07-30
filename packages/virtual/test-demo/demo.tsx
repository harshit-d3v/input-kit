import React, { useMemo, useRef, useState } from 'react';
import { VirtualGrid, VirtualList, type VirtualListRef } from '../src/index';

type FeedItem = {
  id: string;
  title: string;
  summary: string;
  height: number;
};

function createFeed(start: number, count: number): FeedItem[] {
  return Array.from({ length: count }, (_, index) => {
    const absoluteIndex = start + index;
    return {
      id: `feed-${absoluteIndex}`,
      title: `Session ${absoluteIndex + 1}`,
      summary:
        absoluteIndex % 3 === 0
          ? 'Revenue anomaly flagged and routed to the growth team.'
          : absoluteIndex % 3 === 1
          ? 'Launch checklist synced across design, docs, and release ops.'
          : 'Customer note added to the weekly product digest.',
      height: 72 + (absoluteIndex % 4) * 18,
    };
  });
}

function createGallery() {
  return Array.from({ length: 18 }, (_, index) => ({
    id: `gallery-${index}`,
    label: `Card ${index + 1}`,
    tone: ['#0f766e', '#2563eb', '#7c3aed', '#ea580c'][index % 4],
  }));
}

export function Demo() {
  const listRef = useRef<VirtualListRef>(null);
  const [feedItems, setFeedItems] = useState(() => createFeed(0, 120));
  const [loadingMore, setLoadingMore] = useState(false);
  const galleryItems = useMemo(() => createGallery(), []);

  const loadMore = () => {
    if (loadingMore || feedItems.length >= 220) {
      return;
    }

    setLoadingMore(true);
    window.setTimeout(() => {
      setFeedItems((currentItems) => [...currentItems, ...createFeed(currentItems.length, 32)]);
      setLoadingMore(false);
    }, 350);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '48px 20px 72px',
        background:
          'radial-gradient(circle at top left, rgba(2,132,199,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(14,165,233,0.16), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)',
        color: '#0f172a',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0369a1' }}>
            Input Kit Virtual
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 0.96 }}>
            Virtualization primitives for feeds and grids that still feel rich when the dataset gets huge.
          </h1>
          <p style={{ maxWidth: 780, margin: 0, color: '#334155', fontSize: 18, lineHeight: 1.6 }}>
            The list below uses dynamic item sizing, an imperative ref for jump navigation, and the new `onEndReached` callback to append more records as you approach the end.
          </p>
        </header>

        <section style={{ background: '#ffffff', borderRadius: 24, border: '1px solid rgba(148,163,184,0.22)', padding: 24, display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#0f172a', color: '#f8fafc', cursor: 'pointer' }} onClick={() => listRef.current?.scrollToIndex(0, 'start')}>
              Jump to top
            </button>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#0ea5e9', color: '#082f49', cursor: 'pointer' }} onClick={() => listRef.current?.scrollToIndex(60, 'center')}>
              Spotlight item 61
            </button>
            <button style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: '#bae6fd', color: '#0c4a6e', cursor: 'pointer' }} onClick={() => listRef.current?.scrollToIndex(feedItems.length - 1, 'end')}>
              Jump to end
            </button>
          </div>

          <VirtualList
            ref={listRef}
            items={feedItems}
            height={380}
            estimateSize={88}
            overscan={8}
            getItemSize={(index) => feedItems[index]?.height ?? 88}
            onEndReached={loadMore}
            onEndReachedThreshold={180}
            renderItem={(item, index) => (
              <div
                style={{
                  margin: '0 12px 12px',
                  borderRadius: 18,
                  padding: 18,
                  background: index % 2 === 0 ? '#eff6ff' : '#ffffff',
                  border: '1px solid rgba(148,163,184,0.18)',
                  boxShadow: '0 12px 24px rgba(14,165,233,0.06)',
                }}
              >
                <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0369a1' }}>Activity</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{item.title}</div>
                <p style={{ marginBottom: 0, color: '#475569', lineHeight: 1.55 }}>{item.summary}</p>
              </div>
            )}
          />

          {loadingMore && <div style={{ color: '#0369a1' }}>Loading more items…</div>}
        </section>

        <section style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 24, padding: 24, display: 'grid', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Virtual grid showcase</h2>
          <VirtualGrid
            items={galleryItems}
            columnCount={3}
            cellWidth={220}
            cellHeight={150}
            // 3 columns of 220 with 16 between them — sized to show all three.
            width={3 * 220 + 2 * 16}
            height={360}
            gap={16}
            renderItem={(item) => (
              <div
                style={{
                  height: '100%',
                  borderRadius: 20,
                  padding: 18,
                  background: `linear-gradient(135deg, ${item.tone}, #0f172a)`,
                  color: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.8 }}>Module</span>
                <strong style={{ fontSize: 24 }}>{item.label}</strong>
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

export default Demo;

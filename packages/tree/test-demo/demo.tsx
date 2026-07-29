import React, { useMemo, useState } from 'react';
import { Tree, VirtualTree, type TreeNode } from '../src/index';

type NodeMeta = {
  kind: 'folder' | 'file';
};

const explorerNodes: TreeNode<NodeMeta>[] = [
  {
    id: 'src',
    label: 'src',
    data: { kind: 'folder' },
    children: [
      { id: 'src-app', label: 'app.tsx', data: { kind: 'file' } },
      { id: 'src-layouts', label: 'layouts', data: { kind: 'folder' }, children: [{ id: 'src-layouts-shell', label: 'shell.tsx', data: { kind: 'file' } }] },
      { id: 'src-components', label: 'components', data: { kind: 'folder' }, children: [{ id: 'src-components-command', label: 'command-palette.tsx', data: { kind: 'file' } }, { id: 'src-components-feed', label: 'activity-feed.tsx', data: { kind: 'file' } }] },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    data: { kind: 'folder' },
    children: [
      { id: 'docs-architecture', label: 'architecture.md', data: { kind: 'file' } },
      { id: 'docs-release', label: 'release-plan.md', data: { kind: 'file' } },
    ],
  },
  { id: 'package', label: 'package.json', data: { kind: 'file' } },
];

const permissionNodes: TreeNode<NodeMeta>[] = [
  {
    id: 'workspace',
    label: 'Workspace access',
    data: { kind: 'folder' },
    children: [
      { id: 'workspace-view', label: 'View analytics', data: { kind: 'file' } },
      { id: 'workspace-edit', label: 'Edit content', data: { kind: 'file' } },
      { id: 'workspace-publish', label: 'Publish updates', data: { kind: 'file' } },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    data: { kind: 'folder' },
    children: [
      { id: 'billing-view', label: 'View invoices', data: { kind: 'file' } },
      { id: 'billing-manage', label: 'Manage plan', data: { kind: 'file' } },
    ],
  },
];

function createVirtualNodes(): TreeNode<NodeMeta>[] {
  return Array.from({ length: 24 }, (_, folderIndex) => ({
    id: `team-${folderIndex}`,
    label: `Team ${folderIndex + 1}`,
    data: { kind: 'folder' },
    children: Array.from({ length: 8 }, (_, fileIndex) => ({
      id: `team-${folderIndex}-file-${fileIndex}`,
      label: `brief-${folderIndex + 1}-${fileIndex + 1}.md`,
      data: { kind: 'file' },
    })),
  }));
}

export function Demo() {
  const [activeNode, setActiveNode] = useState('app.tsx');
  const virtualNodes = useMemo(() => createVirtualNodes(), []);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '48px 20px 72px',
        background:
          'radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 26%), radial-gradient(circle at bottom right, rgba(59,130,246,0.18), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
        color: '#0f172a',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#166534' }}>
            Input Kit Tree
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 0.96 }}>
            Tree views with the keyboard behavior people expect from editors, not just nested indents.
          </h1>
          <p style={{ maxWidth: 780, margin: 0, color: '#334155', fontSize: 18, lineHeight: 1.6 }}>
            Arrow keys move through visible nodes, Right expands or dives into children, Left collapses or climbs to the parent, and the virtualized tree keeps large datasets snappy.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 440px) minmax(280px, 1fr)', gap: 20 }}>
          <article style={{ background: '#ffffff', borderRadius: 24, border: '1px solid rgba(148,163,184,0.22)', padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Workspace explorer</h2>
            <Tree
              nodes={explorerNodes}
              selectionMode="multiple"
              defaultExpandedIds={['src', 'src-components']}
              onNodeClick={(node) => setActiveNode(node.label)}
            />
          </article>

          <article style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 24, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Selection snapshot</h2>
            <p style={{ lineHeight: 1.6, color: '#cbd5e1' }}>
              Click a node or use the keyboard to move focus. The active selection is captured outside the tree so it can coordinate other panels.
            </p>
            <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }}>“{activeNode}”</div>
          </article>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <article style={{ background: '#ffffff', borderRadius: 24, border: '1px solid rgba(148,163,184,0.22)', padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Permission matrix</h2>
            <Tree
              nodes={permissionNodes}
              showCheckbox
              selectionMode="checkbox"
              defaultExpandedIds={['workspace', 'billing']}
            />
          </article>

          <article style={{ background: '#ffffff', borderRadius: 24, border: '1px solid rgba(148,163,184,0.22)', padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Virtualized project map</h2>
            <VirtualTree
              nodes={virtualNodes}
              height={320}
              itemHeight={34}
              defaultExpandedIds={['team-0', 'team-1', 'team-2']}
            />
          </article>
        </section>
      </div>
    </div>
  );
}

export default Demo;

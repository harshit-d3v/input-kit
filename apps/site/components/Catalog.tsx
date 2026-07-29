'use client';

import { useMemo, useState } from 'react';
import type { PackageEntry } from '../lib/registry';
import { CoverageGlyph } from './CoverageGlyph';

type Filter = 'all' | 'tested' | 'untested';

export function Catalog({ packages, scaleMax }: { packages: PackageEntry[]; scaleMax: number }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((p) => {
      if (filter === 'tested' && !p.hasTests) return false;
      if (filter === 'untested' && p.hasTests) return false;
      if (!q) return true;
      return (
        p.slug.includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q)) ||
        p.exportNames.some((e) => e.toLowerCase().includes(q))
      );
    });
  }, [packages, query, filter]);

  const counts = useMemo(
    () => ({
      all: packages.length,
      tested: packages.filter((p) => p.hasTests).length,
      untested: packages.filter((p) => !p.hasTests).length,
    }),
    [packages],
  );

  return (
    <>
      <div className="filters">
        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, export, or keyword…"
          aria-label="Filter packages"
        />
        {(['all', 'tested', 'untested'] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">No package matches “{query}”.</p>
      ) : (
        <ul className="sheet">
          {shown.map((p) => (
            <li key={p.slug} style={{ display: 'contents' }}>
              <a className="cell" href={`/p/${p.slug}`}>
                <span className="cell-top">
                  <span className="cell-name">
                    <span>@input-kit/</span>
                    {p.slug}
                  </span>
                  <span className="cell-ver">{p.version}</span>
                </span>
                <p className="cell-desc">{p.description}</p>
                <span className="cell-foot">
                  <span className="cell-nums">
                    <span>{p.exportNames.length} exports</span>
                    <span className={p.hasTests ? undefined : 'badge-untested'}>
                      {p.hasTests ? `${p.testLines} test lines` : 'no tests yet'}
                    </span>
                  </span>
                  <CoverageGlyph
                    srcLines={p.srcLines}
                    testLines={p.testLines}
                    scaleMax={scaleMax}
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

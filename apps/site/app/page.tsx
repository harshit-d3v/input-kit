import { Catalog } from '../components/Catalog';
import { CoverageGlyph, GlyphLegend } from '../components/CoverageGlyph';
import { externalPackages, packages, totals } from '../lib/registry';

const scaleMax = Math.max(...packages.map((p) => p.srcLines + p.testLines));

export default function HomePage() {
  const byVolume = [...packages].sort((a, b) => b.srcLines + b.testLines - (a.srcLines + a.testLines));

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">
            {totals.count + externalPackages.length} packages · MIT · React 18 &amp; 19
          </p>
          <h1>
            Behaviour and ARIA. <em>No CSS.</em>
          </h1>
          <p className="lede">
            Headless React primitives that hand you state, event handlers, and the right ARIA
            attributes — then get out of the way. No stylesheet, no theme provider, no specificity
            fight with the design system you already have.
          </p>
          <div className="install">
            <span className="tag">npm</span>
            <code>npm i @input-kit/combobox @input-kit/table @input-kit/toast</code>
          </div>
        </div>

        <div>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>
            Every package, by volume
          </p>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: '0.3rem',
            }}
          >
            {byVolume.map((p) => (
              <li
                key={p.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(5.5rem, auto) 1fr',
                  alignItems: 'center',
                  gap: '0.625rem',
                }}
              >
                <a
                  href={`/p/${p.slug}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--slate)',
                    textDecoration: 'none',
                    textAlign: 'right',
                  }}
                >
                  {p.slug}
                </a>
                <CoverageGlyph srcLines={p.srcLines} testLines={p.testLines} scaleMax={scaleMax} />
              </li>
            ))}
          </ul>
          <GlyphLegend />
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--slate)',
              marginTop: '0.75rem',
              lineHeight: 1.5,
            }}
          >
            {totals.srcLines.toLocaleString()} lines of source ·{' '}
            {totals.testLines.toLocaleString()} lines of tests · {totals.tested} of {totals.count}{' '}
            packages have a suite. The hatching is the work still to do.
          </p>
        </div>
      </section>

      <section id="catalog">
        <div className="sheet-head">
          <h2>Catalog</h2>
          <p>Each package runs live on its own page</p>
        </div>
        <Catalog packages={packages} scaleMax={scaleMax} />

        <div className="sheet-head">
          <h2>Separate repository</h2>
          <p>Released before this monorepo existed</p>
        </div>
        <ul className="sheet">
          {externalPackages.map((p) => (
            <li key={p.slug} style={{ display: 'contents' }}>
              <a className="cell" href={p.repo} rel="noreferrer noopener">
                <span className="cell-top">
                  <span className="cell-name">
                    <span>@input-kit/</span>
                    {p.slug}
                  </span>
                  <span className="cell-ver">{p.version}</span>
                </span>
                <p className="cell-desc">{p.description}</p>
                <span className="cell-nums">
                  <span>own repo →</span>
                  <span>github.com/harshit-d3v</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

/**
 * A package's source and test volume, drawn to a shared scale.
 *
 * The bar is the site's one recurring visual device, and it encodes real
 * numbers rather than decorating: indigo is source, magenta is tests, and a
 * hatched remainder means no test suite exists yet. Laid out in a grid across
 * the whole catalog, the hatching is what shows where the gaps are.
 */
export function CoverageGlyph({
  srcLines,
  testLines,
  scaleMax,
}: {
  srcLines: number;
  testLines: number;
  scaleMax: number;
}) {
  const total = srcLines + testLines;
  const srcPct = (srcLines / scaleMax) * 100;
  const testPct = (testLines / scaleMax) * 100;
  const untested = testLines === 0;

  const label = untested
    ? `${srcLines} lines of source, no tests yet`
    : `${srcLines} lines of source, ${testLines} lines of tests`;

  return (
    <div className="glyph" role="img" aria-label={label} title={label}>
      <span className="glyph-src" style={{ width: `${srcPct}%` }} />
      {testLines > 0 && <span className="glyph-test" style={{ width: `${testPct}%` }} />}
      {untested && <span className="glyph-untested" />}
      {!untested && total < scaleMax && <span style={{ flex: 1 }} />}
    </div>
  );
}

export function GlyphLegend() {
  return (
    <p className="glyph-legend">
      <span>
        <i className="swatch-src" aria-hidden="true" /> source
      </span>
      <span>
        <i className="swatch-test" aria-hidden="true" /> tests
      </span>
      <span>
        <i className="swatch-none" aria-hidden="true" /> no tests yet
      </span>
    </p>
  );
}

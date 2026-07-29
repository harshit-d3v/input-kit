// Three demo files contain two concatenated copies of themselves, the second
// truncated mid-expression — an artefact of the batch generator appending
// instead of overwriting. Keep the first complete copy, drop the remainder.
//
// Boundaries were read off each file by hand; each `keep` line is the last line
// of the first, valid copy, and `expectAtKeep` is asserted before truncating so
// this can't silently cut the wrong place if the files change.
import { readFileSync, writeFileSync } from 'node:fs';
import { transform } from 'esbuild';

const PKGS = 'C:/harshitJet/input-kit/packages';

const targets = [
  { slug: 'color', keep: 350, expectAtKeep: 'export default Demo;' },
  { slug: 'confetti', keep: 209, expectAtKeep: '}' },
  { slug: 'tooltip', keep: 153, expectAtKeep: 'export default Demo;' },
];

for (const { slug, keep, expectAtKeep } of targets) {
  const f = `${PKGS}/${slug}/test-demo/demo.tsx`;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  const actual = (lines[keep - 1] ?? '').trim();

  if (actual !== expectAtKeep) {
    console.error(`SKIP ${slug}: line ${keep} is "${actual}", expected "${expectAtKeep}"`);
    continue;
  }

  const kept = lines.slice(0, keep).join('\n') + '\n';
  try {
    await transform(kept, { loader: 'tsx', format: 'esm' });
  } catch (err) {
    console.error(`SKIP ${slug}: truncated form still does not parse — ${err.errors?.[0]?.text}`);
    continue;
  }

  writeFileSync(f, kept);
  console.log(`${slug}: ${lines.length} lines -> ${keep} (dropped ${lines.length - keep} duplicated)`);
}

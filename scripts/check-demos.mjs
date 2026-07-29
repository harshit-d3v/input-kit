// Parse-check every demo file. The batch generation scripts that created these
// left several truncated or duplicated, which only shows up at bundle time.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { transform } from 'esbuild';

const PKGS = 'C:/harshitJet/input-kit/packages';
const dirs = readdirSync(PKGS).filter((d) => statSync(join(PKGS, d)).isDirectory()).sort();

const broken = [];
const ok = [];

for (const slug of dirs) {
  const f = join(PKGS, slug, 'test-demo', 'demo.tsx');
  if (!existsSync(f)) continue;
  const code = readFileSync(f, 'utf8');
  try {
    await transform(code, { loader: 'tsx', format: 'esm' });
    ok.push(slug);
  } catch (err) {
    const msg = err.errors?.[0];
    broken.push({ slug, line: msg?.location?.line, text: msg?.text });
  }
}

console.log(`parse OK: ${ok.length}`);
console.log(`BROKEN:   ${broken.length}`);
for (const b of broken) console.log(`  ${b.slug.padEnd(12)} line ${String(b.line).padEnd(5)} ${b.text}`);

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PKGS = 'C:/harshitJet/input-kit/packages';
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);

const dirs = readdirSync(PKGS).filter((d) => statSync(join(PKGS, d)).isDirectory()).sort();
const changed = [];

for (const slug of dirs) {
  const dir = join(PKGS, slug);
  const srcDir = join(dir, 'src');
  const hasTests = existsSync(srcDir)
    && walk(srcDir).some((f) => /\.(test|spec)\.(ts|tsx)$/.test(f));

  const p = join(dir, 'package.json');
  const pj = JSON.parse(readFileSync(p, 'utf8'));
  if (!pj.scripts?.test) continue;

  const base = pj.scripts.test.replace(/\s*--passWithNoTests/g, '');
  // No suite yet: exit 0 rather than failing the workspace run. Packages that
  // do have suites keep the strict behaviour, so a vanished test file is loud.
  const next = hasTests ? base : `${base} --passWithNoTests`;

  if (next !== pj.scripts.test) {
    pj.scripts.test = next;
    writeFileSync(p, JSON.stringify(pj, null, 2) + '\n');
    changed.push(`${slug}: ${hasTests ? 'strict' : 'passWithNoTests'}`);
  }
}

console.log(changed.join('\n'));
console.log(`\n${changed.length} test scripts updated`);

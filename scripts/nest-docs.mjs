// Vercel serves dist as the site root. Astro writes pages at that root and
// prefixes every URL with /docs, so /docs 404s. On Vercel, move the build
// under dist/docs. Local preview keeps Astro's own base handling.
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

if (process.env.VERCEL !== '1') {
  process.exit(0);
}

const root = process.cwd();
const dist = join(root, 'dist');
const staging = join(root, '.dist-flat');

rmSync(staging, { recursive: true, force: true });
mkdirSync(staging);
for (const name of readdirSync(dist)) {
  cpSync(join(dist, name), join(staging, name), { recursive: true });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'docs'), { recursive: true });
for (const name of readdirSync(staging)) {
  cpSync(join(staging, name), join(dist, 'docs', name), { recursive: true });
}
rmSync(staging, { recursive: true, force: true });

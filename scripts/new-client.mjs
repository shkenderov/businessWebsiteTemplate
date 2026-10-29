#!/usr/bin/env node
// Usage: npm run new-client -- <slug> [--from roofer|hvac|demo|<any existing client>]
// Copies a starting config to src/clients/<slug>.json so you only edit the fields.
// Starting points live in src/clients/_examples/ (not deployed) or src/clients/.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const fromIdx = args.indexOf('--from');
const from = fromIdx >= 0 ? args[fromIdx + 1] : 'roofer';

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Give a slug in latin lowercase, e.g.: npm run new-client -- yordan-pokrivi --from roofer');
  process.exit(1);
}

const candidates = [resolve('src/clients/_examples', `${from}.json`), resolve('src/clients', `${from}.json`)];
const src = candidates.find((p) => existsSync(p));
const dest = resolve('src/clients', `${slug}.json`);
if (!src) {
  const examples = readdirSync(resolve('src/clients/_examples')).map((f) => f.replace(/\.json$/, '')).join(', ');
  console.error(`No starting config "${from}". Available examples: ${examples}`);
  process.exit(1);
}
if (existsSync(dest)) { console.error(`${dest} already exists`); process.exit(1); }

const cfg = JSON.parse(readFileSync(src, 'utf8'));
delete cfg.default;
writeFileSync(dest, JSON.stringify(cfg, null, 2) + '\n');
console.log(`Created src/clients/${slug}.json → will be served at /${slug}/`);
console.log('Edit business.name, phone, address, areas, hero, reviews — then git push.');

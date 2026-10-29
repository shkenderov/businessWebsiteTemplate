#!/usr/bin/env node
// Usage: npm run new-client -- <slug> [--from demo-roofer|demo-hvac]
// Copies a demo config to src/clients/<slug>.json so you only edit the fields.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const fromIdx = args.indexOf('--from');
const from = fromIdx >= 0 ? args[fromIdx + 1] : 'demo-roofer';

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Give a slug in latin lowercase, e.g.: npm run new-client -- yordan-pokrivi --from demo-roofer');
  process.exit(1);
}

const src = resolve('src/clients', `${from}.json`);
const dest = resolve('src/clients', `${slug}.json`);
if (!existsSync(src)) { console.error(`No template ${from}`); process.exit(1); }
if (existsSync(dest)) { console.error(`${dest} already exists`); process.exit(1); }

const cfg = JSON.parse(readFileSync(src, 'utf8'));
delete cfg.default;
writeFileSync(dest, JSON.stringify(cfg, null, 2) + '\n');
console.log(`Created src/clients/${slug}.json → will be served at /${slug}/`);
console.log('Edit business.name, phone, address, areas, hero, reviews — then git push.');

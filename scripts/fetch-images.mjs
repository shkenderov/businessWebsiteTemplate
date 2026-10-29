#!/usr/bin/env node
/**
 * Downloads every Unsplash photo referenced by any client config into
 * public/images/u/<photo-id>-{640,1024,1600}.jpg, so the built site serves
 * its own images. imageUrl()/imageSrcset() in src/lib/clients.ts use the
 * local copies when public/images/u/manifest.json lists the id.
 *
 * Run by the deploy workflow before `astro build`, and by the fetch-images
 * workflow which commits the results. Safe to re-run: existing files are kept.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'public/images/u';
const WIDTHS = [640, 1024, 1600];
mkdirSync(OUT, { recursive: true });

function* walk(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) yield* walk(p);
    else if (f.name.endsWith('.json')) yield p;
  }
}
const ids = new Set();
const re = /https:\/\/images\.unsplash\.com\/photo-([A-Za-z0-9-]+)/g;
for (const f of walk('src/clients')) for (const m of readFileSync(f, 'utf8').matchAll(re)) ids.add(m[1]);

const manifestPath = join(OUT, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
let fetched = 0;
for (const id of ids) {
  const done = WIDTHS.every((w) => existsSync(join(OUT, `${id}-${w}.jpg`)));
  if (done) { manifest[id] = true; continue; }
  try {
    for (const w of WIDTHS) {
      const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78&fm=jpg`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} for ${id}@${w}`);
      writeFileSync(join(OUT, `${id}-${w}.jpg`), Buffer.from(await res.arrayBuffer()));
    }
    manifest[id] = true; fetched++;
    console.log('fetched', id);
  } catch (e) {
    console.warn('skip', id, String(e));
  }
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
console.log(`${ids.size} photos referenced, ${fetched} fetched now, ${Object.keys(manifest).length} local.`);

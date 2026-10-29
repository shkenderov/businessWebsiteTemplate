// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// GitHub Pages: https://shkenderov.github.io/businessWebsiteTemplate/
// If you move the project to a custom domain, set `site` to that domain and
// `base` to '/'.

// Pages whose config says "noindex" (demos, pitches) stay out of the sitemap too.
const clientsDir = new URL('./src/clients/', import.meta.url);
const noindexSlugs = new Set();
let defaultIsNoindex = false;
for (const file of readdirSync(clientsDir)) {
  if (!file.endsWith('.json')) continue;
  const cfg = JSON.parse(readFileSync(new URL(file, clientsDir), 'utf8'));
  if (cfg.seo?.noindex) {
    noindexSlugs.add(file.replace(/\.json$/, ''));
    if (cfg.default) defaultIsNoindex = true;
  }
}

export default defineConfig({
  site: 'https://shkenderov.github.io',
  base: '/businessWebsiteTemplate',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/^\/businessWebsiteTemplate/, '');
        if (path === '/' || path === '') return !defaultIsNoindex;
        const slug = path.replace(/^\/|\/$/g, '');
        return !noindexSlugs.has(slug);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

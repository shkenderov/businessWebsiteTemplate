// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://shkenderov.github.io/businessWebsiteTemplate/
// If you move the project to a custom domain, set `site` to that domain and
// `base` to '/'.
export default defineConfig({
  site: 'https://shkenderov.github.io',
  base: '/businessWebsiteTemplate',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});

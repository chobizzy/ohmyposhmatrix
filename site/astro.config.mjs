// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site. Canonical URLs, OG and the sitemap depend on `site` + `base`.
export default defineConfig({
  site: 'https://chobizzy.github.io',
  base: '/ohmyposhmatrix',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
  // site/src/data/site.ts reads ../matrix.omp.json, which sits outside the Astro root.
  vite: { server: { fs: { allow: ['..'] } } },
});

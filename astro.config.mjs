// @ts-check
import { statSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fumadocs from '@fumadocs/astro';
import sitemap from '@astrojs/sitemap';

const origin = 'https://yellowbird.amaanworks.me';
/** @type {Record<string, string>} */
const docPages = {
  [`${origin}/docs`]: 'index',
  [`${origin}/docs/run`]: 'run',
  [`${origin}/docs/architecture`]: 'architecture',
  [`${origin}/docs/backend`]: 'backend',
  [`${origin}/docs/web`]: 'web',
  [`${origin}/docs/ops`]: 'ops',
  [`${origin}/docs/api`]: 'api',
};

export default defineConfig({
  site: 'https://yellowbird.amaanworks.me',
  base: '/docs',
  trailingSlash: 'never',
  integrations: [
    fumadocs({
      components: './src/components/mdx.tsx',
      rehypeCodeOptions: {
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      },
    }),
    sitemap({
      filter: (page) => page !== `${origin}/docs/` && !page.includes('/api/search') && !page.endsWith('/404'),
      serialize(item) {
        const slug = docPages[item.url];
        if (!slug) return item;
        const file = new URL(`./content/docs/${slug}.mdx`, import.meta.url);
        item.lastmod = statSync(file).mtime.toISOString();
        item.changefreq = slug === 'index' ? 'weekly' : 'monthly';
        item.priority = slug === 'index' ? 1 : 0.8;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

// @ts-check
import { statSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fumadocs from '@fumadocs/astro';
import sitemap from '@astrojs/sitemap';

const origin = 'https://yellowbird.amaanworks.me';
const docPages = {
  [`${origin}/docs`]: 'index',
  [`${origin}/docs/architecture`]: 'architecture',
  [`${origin}/docs/product`]: 'product',
  [`${origin}/docs/api`]: 'api',
  [`${origin}/docs/workers`]: 'workers',
  [`${origin}/docs/cloud`]: 'cloud',
  [`${origin}/docs/run`]: 'run',
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
          dark: 'github-light',
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
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

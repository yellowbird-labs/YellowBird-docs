// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fumadocs from '@fumadocs/astro';
import sitemap from '@astrojs/sitemap';

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
      filter: (page) => page !== 'https://yellowbird.amaanworks.me/docs/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

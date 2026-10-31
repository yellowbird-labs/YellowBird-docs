import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://yellowbird.amaanworks.me');
  const sitemap = new URL('sitemap-index.xml', new URL(`${import.meta.env.BASE_URL}/`, origin));
  const body = `User-agent: *\nAllow: /docs/\nDisallow: /docs/api/search\n\nSitemap: ${sitemap.href}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://yellowbird.amaanworks.me');
  const sitemap = new URL('sitemap-index.xml', new URL(`${import.meta.env.BASE_URL}/`, origin));
  const allow = `Allow: /docs/\nDisallow: /docs/api/search\n`;
  const agents = ['*', 'Googlebot', 'Bingbot', 'DuckDuckBot', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended'];
  const blocks = agents.map((agent) => `User-agent: ${agent}\n${allow}`).join('\n');
  const body = `${blocks}\nSitemap: ${sitemap.href}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

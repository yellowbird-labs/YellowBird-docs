import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const order = ['index', 'run', 'architecture', 'backend', 'web', 'ops', 'api'];

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://yellowbird.amaanworks.me');
  const docsRoot = new URL(import.meta.env.BASE_URL, origin).href.replace(/\/$/, '');
  const pages = await getCollection('docs');
  const bySlug = new Map(
    pages.map((page) => {
      const slug = page.id.replace(/\.mdx$/, '');
      return [slug, page] as const;
    }),
  );

  const items = order
    .map((slug) => {
      const page = bySlug.get(slug);
      if (!page) return '';
      const link = slug === 'index' ? docsRoot : `${docsRoot}/${slug}`;
      const title = slug === 'index' ? 'YellowBird docs' : String(page.data.title);
      const description = String(page.data.description ?? '');
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .filter(Boolean)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>YellowBird docs</title>
    <link>${docsRoot}</link>
    <description>Documentation for YellowBird, a Go media pipeline.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};

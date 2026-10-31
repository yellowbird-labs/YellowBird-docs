import type { APIRoute } from 'astro';
import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

const server = createFromSource(source, {
  language: 'english',
});

export const prerender = true;

export const GET: APIRoute = async () => {
  const response = await server.staticGET();
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex');
  return new Response(response.body, { status: response.status, headers });
};

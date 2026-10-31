import type { APIRoute } from 'astro';
import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

const server = createFromSource(source, {
  language: 'english',
});

export const prerender = true;

export const GET: APIRoute = async () => server.staticGET();

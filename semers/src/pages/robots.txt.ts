import type { APIRoute } from 'astro';
import { originOf } from '~/lib/origin';

export const GET: APIRoute = ({ site }) => {
  const origin = originOf(site);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /cart/',
    'Disallow: /checkout/',
    'Disallow: /order/',
    'Disallow: /api/',
    '',
    // Shoppers increasingly ask an assistant instead of a search engine, so the
    // answer engines are named explicitly rather than left to the wildcard.
    'User-agent: OAI-SearchBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

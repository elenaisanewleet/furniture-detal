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
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

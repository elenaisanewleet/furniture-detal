import type { APIRoute } from 'astro';
import { originOf } from '~/lib/origin';

export const GET: APIRoute = ({ site }) => {
  const origin = originOf(site);
  const body = [
    'User-agent: *',
    'Allow: /',
    /*
     * The cart, checkout and thank-you pages are not listed here on purpose.
     * They already carry noindex, and a crawler has to fetch a page to see
     * that — disallowing them would hide the very instruction that keeps them
     * out of the index, and Google would be free to list the bare URL from a
     * link. The endpoints below are different: nothing there is a page, so
     * there is no noindex to see and no reason to fetch them.
     */
    'Disallow: /api/',
    'Disallow: /admin/',
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

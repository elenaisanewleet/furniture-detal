/** Origin (scheme + host) from Astro.site, without trailing slash. */
export function originOf(site: URL | undefined): string {
  return (site?.toString() || 'https://semers.org/').replace(/\/$/, '');
}

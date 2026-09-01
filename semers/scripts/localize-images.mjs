#!/usr/bin/env node
/**
 * Downloads every remote image in src/data/images.ts into public/img/, converts it
 * to an optimised WebP (keeping transparency) plus the original as a fallback, and
 * writes the `local` path back into images.ts so the site stops depending on the
 * Higgsfield CDN. Run once before launch, then commit public/img:
 *
 *   npm run localize-images
 *
 * Re-running is safe: files already present are skipped unless --force is given.
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const FORCE = process.argv.includes('--force');
const OUT = 'public/img';
const SRC = 'src/data/images.ts';
mkdirSync(OUT, { recursive: true });

let ts = readFileSync(SRC, 'utf8');
const entryRe = /^(\s+)'?([a-z0-9-]+)'?: \{\n([\s\S]*?)\n\1\},/gm;
const entries = [...ts.matchAll(entryRe)].map((m) => ({ key: m[2], body: m[3], full: m[0], indent: m[1] }));
if (!entries.length) throw new Error('No image entries found');

const CDN = (ts.match(/const CDN = '([^']+)'/) || [])[1];
const UPLOADS = (ts.match(/const UPLOADS = '([^']+)'/) || [])[1];

for (const e of entries) {
  const m = e.body.match(/remote: (CDN|UPLOADS) \+ '([^']+)'/);
  if (!m) continue;
  const url = (m[1] === 'CDN' ? CDN : UPLOADS) + m[2];
  const isPng = /\.png$/i.test(m[2]);
  const target = join(OUT, `${e.key}.${isPng ? 'png' : 'jpg'}`);
  const webp = join(OUT, `${e.key}.webp`);
  if (!FORCE && existsSync(webp)) {
    console.log('skip ', e.key);
  } else {
    process.stdout.write(`fetch ${e.key} … `);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`FAILED ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const img = sharp(buf, { failOn: 'none' });
    const meta = await img.metadata();
    const width = Math.min(meta.width || 2048, 2400);
    await img.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(webp);
    if (isPng && meta.hasAlpha) await img.clone().resize({ width, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(target);
    else await img.clone().resize({ width, withoutEnlargement: true }).jpeg({ quality: 84, progressive: true, mozjpeg: true }).toFile(target);
    console.log(`ok (${meta.width}×${meta.height})`);
  }
  // write/refresh the local path (WebP is served; browsers without WebP are negligible in 2026)
  const localLine = `${e.indent}  local: '/img/${e.key}.webp',`;
  let body = e.body.replace(/\n\s+local: '[^']*',/, '');
  body = body.replace(/(remote: (?:CDN|UPLOADS) \+ '[^']+',)/, `$1\n${localLine.trimStart() ? localLine : ''}`);
  ts = ts.replace(e.full, `${e.indent}${e.key.includes('-') ? `'${e.key}'` : e.key}: {\n${body}\n${e.indent}},`);
}
writeFileSync(SRC, ts);
console.log('\nimages.ts updated — commit public/img and src/data/images.ts');

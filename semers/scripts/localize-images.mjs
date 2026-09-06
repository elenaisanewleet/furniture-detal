#!/usr/bin/env node
/**
 * Downloads every remote image in src/data/images.ts into public/img/, writes an
 * optimised WebP (keeping transparency) plus resized width variants for `srcset`,
 * and records the `local` path and `widths` back into images.ts so the site stops
 * depending on the Higgsfield CDN and serves right-sized images. Run once before
 * launch, then commit public/img:
 *
 *   npm run localize-images
 *
 * Re-running is safe: keys whose files already exist are skipped unless --force is
 * given. Options (mostly for testing the pipeline offline):
 *   --force                 re-download and re-encode everything
 *   --source-dir <dir>      read <key>.<ext> files from a folder instead of fetching
 *   --manifest <file>       images.ts to read/update (default src/data/images.ts)
 *   --out <dir>             output folder (default public/img)
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
const FORCE = argv.includes('--force');
const SOURCE_DIR = flag('--source-dir');
const SRC = flag('--manifest') || 'src/data/images.ts';
const OUT = flag('--out') || 'public/img';
/** Variant widths; a width is only written when the source is wider than it. */
const WIDTHS = [480, 960, 1600];
const MAX_WIDTH = 2400;
mkdirSync(OUT, { recursive: true });

let ts = readFileSync(SRC, 'utf8');
const entryRe = /^(\s+)'?([a-z0-9-]+)'?: \{\n([\s\S]*?)\n\1\},/gm;
const entries = [...ts.matchAll(entryRe)].map((m) => ({ key: m[2], body: m[3], full: m[0], indent: m[1] }));
if (!entries.length) throw new Error('No image entries found');

const CDN = (ts.match(/const CDN = '([^']+)'/) || [])[1];
const UPLOADS = (ts.match(/const UPLOADS = '([^']+)'/) || [])[1];

async function loadSource(key, url) {
  if (SOURCE_DIR) {
    const file = readdirSync(SOURCE_DIR).find((f) => f.replace(/\.[a-z0-9]+$/i, '') === key);
    if (!file) return null;
    return readFileSync(join(SOURCE_DIR, file));
  }
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`FAILED ${res.status}`);
    return null;
  }
  return Buffer.from(await res.arrayBuffer());
}

let done = 0;
for (const e of entries) {
  const m = e.body.match(/remote: (CDN|UPLOADS) \+ '([^']+)'/);
  if (!m) continue;
  const url = (m[1] === 'CDN' ? CDN : UPLOADS) + m[2];
  const webp = join(OUT, `${e.key}.webp`);
  let widths = [];
  let fullWidth;
  let fullHeight;

  if (!FORCE && existsSync(webp)) {
    const meta = await sharp(webp).metadata();
    fullWidth = meta.width;
    fullHeight = meta.height;
    widths = WIDTHS.filter((w) => existsSync(join(OUT, `${e.key}-${w}.webp`)));
    console.log(`skip  ${e.key} (${fullWidth}×${fullHeight}, variants ${widths.join('/') || 'none'})`);
  } else {
    process.stdout.write(`${SOURCE_DIR ? 'read ' : 'fetch'} ${e.key} … `);
    const buf = await loadSource(e.key, url);
    if (!buf) {
      console.log('missing');
      continue;
    }
    const img = sharp(buf, { failOn: 'none' });
    const meta = await img.metadata();
    const width = Math.min(meta.width || 2048, MAX_WIDTH);
    const full = await img.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(webp);
    fullWidth = full.width;
    fullHeight = full.height;
    for (const w of WIDTHS) {
      if (w >= fullWidth) continue;
      await img.clone().resize({ width: w }).webp({ quality: 80, effort: 5 }).toFile(join(OUT, `${e.key}-${w}.webp`));
      widths.push(w);
    }
    console.log(`ok (${fullWidth}×${fullHeight}, variants ${widths.join('/') || 'none'})`);
  }
  done++;

  // Refresh local/width/height/widths in the manifest so <img> dimensions match the served file.
  let body = e.body
    .replace(/\n\s+local: '[^']*',/, '')
    .replace(/\n\s+widths: \[[^\]]*\],/, '')
    .replace(/(\n\s+width: )\d+,/, `$1${fullWidth},`)
    .replace(/(\n\s+height: )\d+,/, `$1${fullHeight},`);
  const extra = `\n${e.indent}  local: '/img/${e.key}.webp',` + (widths.length ? `\n${e.indent}  widths: [${widths.join(', ')}],` : '');
  body = body.replace(/(remote: (?:CDN|UPLOADS) \+ '[^']+',)/, `$1${extra}`);
  ts = ts.replace(e.full, `${e.indent}${e.key.includes('-') ? `'${e.key}'` : e.key}: {\n${body}\n${e.indent}},`);
}
writeFileSync(SRC, ts);
console.log(`\n${done} image(s) localised into ${OUT}; ${SRC} updated. Commit both.`);

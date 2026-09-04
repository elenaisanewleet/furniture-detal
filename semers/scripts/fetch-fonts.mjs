/**
 * Fetch the self-hosted font subsets and regenerate the @font-face block.
 *
 * The brand faces are Latin-only. Fraunces and Instrument Sans ship no Cyrillic
 * at all, so every Russian page rendered in Georgia and Arial — a third of the
 * site in neither of the two typefaces it was designed with. Latvian was never
 * affected: ā, ķ, ļ, ņ, š and ž are all in latin-ext.
 *
 * The fix is a second pair chosen to sit beside the first rather than replace
 * it, declared over the Cyrillic ranges only. Because a @font-face applies
 * exclusively inside its unicode-range, the browser then does the mixing on its
 * own: a Russian sentence with "Semers" in it sets the brand name in Fraunces
 * and the Russian words in Literata, from one stylesheet, with no per-language
 * rule anywhere.
 *
 *   Fraunces        → Literata   both variable text serifs with an optical-size
 *                                axis, both warm and slightly idiosyncratic
 *   Instrument Sans → Inter      the nearest neutral grotesk with a Cyrillic cut
 *
 * Google serves a different file per subset, and the URLs carry a version that
 * moves, so this script asks for the current CSS, keeps the faces it wants,
 * downloads them under stable names and writes the @font-face rules from what
 * it actually got. Re-running it is how the fonts are updated.
 *
 * Usage: node scripts/fetch-fonts.mjs [--check]
 *   --check  report what would change and exit non-zero, downloading nothing
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const OUT_DIR = 'public/fonts';
const CSS_PATH = 'src/styles/fonts.css';
/* Google serves woff2 only to a browser that says it can take it. */
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/** `slug` names the files on disk; `subsets` are the ones this site can use. */
const FAMILIES = [
  {
    family: 'Fraunces',
    slug: 'fraunces',
    query: 'Fraunces:ital,opsz,SOFT,WONK,wght@0,9..144,0..100,0..1,300..900;1,9..144,0..100,0..1,300..900',
    subsets: ['latin', 'latin-ext'],
    weight: '300 900',
    note: 'display serif — optical size, softness and the wonk axis',
  },
  {
    family: 'Instrument Sans',
    slug: 'instrument-sans',
    query: 'Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700',
    subsets: ['latin', 'latin-ext'],
    weight: '400 700',
    note: 'grotesk for UI and body text',
  },
  {
    family: 'Literata',
    slug: 'literata',
    query: 'Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900',
    subsets: ['cyrillic', 'cyrillic-ext'],
    weight: '200 900',
    note: 'the display serif for Cyrillic, beside Fraunces',
  },
  {
    family: 'Inter',
    slug: 'inter',
    query: 'Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900',
    subsets: ['cyrillic', 'cyrillic-ext'],
    weight: '100 900',
    note: 'the grotesk for Cyrillic, beside Instrument Sans',
  },
];

/** Split the served CSS into one record per @font-face, keeping its subset comment. */
function parseFaces(css) {
  const faces = [];
  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const body = m[2];
    const field = (name) => (new RegExp(`${name}:\\s*([^;]+);`).exec(body) || [])[1]?.trim();
    const url = /src:\s*url\(([^)]+)\)/.exec(body)?.[1];
    if (!url) continue;
    faces.push({ subset: m[1], style: field('font-style') || 'normal', range: field('unicode-range'), url });
  }
  return faces;
}

const check = process.argv.includes('--check');
const blocks = [];
const changes = [];

for (const f of FAMILIES) {
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${f.query}&display=swap`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${f.family}: the font service answered ${res.status}`);
  const faces = parseFaces(await res.text()).filter((x) => f.subsets.includes(x.subset));

  for (const subset of f.subsets) {
    for (const style of ['normal', 'italic']) {
      const face = faces.find((x) => x.subset === subset && x.style === style);
      if (!face) {
        // Not every family draws a true italic; say so rather than leaving a gap.
        console.log(`  ${f.slug} ${subset} ${style}: not served, skipped`);
        continue;
      }
      const name = `${f.slug}-${style}-${subset}.woff2`;
      const path = `${OUT_DIR}/${name}`;
      if (!existsSync(path)) {
        changes.push(name);
        if (!check) {
          const bin = await fetch(face.url, { headers: { 'User-Agent': UA } });
          if (!bin.ok) throw new Error(`${name}: ${bin.status}`);
          const bytes = Buffer.from(await bin.arrayBuffer());
          await mkdir(OUT_DIR, { recursive: true });
          await writeFile(path, bytes);
          console.log(`  ${name}  ${(bytes.length / 1024).toFixed(1)} kB`);
        }
      }
      blocks.push(
        `@font-face {\n  font-family: '${f.family}';\n  font-style: ${style};\n  font-weight: ${f.weight};\n  font-display: swap;\n  src: url('/fonts/${name}') format('woff2');\n  unicode-range: ${face.range};\n}`,
      );
    }
  }
}

/*
 * The metric-matched fallbacks are hand-tuned against a measured layout shift,
 * so they are kept as written and only the generated part above them is
 * replaced.
 */
const existing = await readFile(CSS_PATH, 'utf-8');
const MARK = '/* ---- hand-tuned below: metric-matched fallbacks ---- */';
const tail = existing.includes(MARK) ? existing.slice(existing.indexOf(MARK)) : `${MARK}\n${existing.slice(existing.indexOf('/* Fallback faces'))}`;

const header = [
  '/*',
  ' * Self-hosted font subsets, written by scripts/fetch-fonts.mjs — edit that,',
  ' * not this block. Every face is scoped to a unicode-range, which is what lets',
  ' * one Russian sentence set its Latin words in the brand face and its Cyrillic',
  ' * in the companion without a single per-language rule.',
  ' *',
  ...FAMILIES.map((f) => ` *   ${f.family.padEnd(16)}${f.subsets.join(', ').padEnd(24)}${f.note}`),
  ' *',
  ' * All four are OFL licensed.',
  ' */',
].join('\n');

const out = `${header}\n${blocks.join('\n')}\n\n${tail.trimEnd()}\n`;

if (check) {
  const same = out === existing;
  console.log(changes.length ? `${changes.length} font files missing: ${changes.join(', ')}` : 'every font file is present');
  console.log(same ? 'fonts.css matches the served faces' : 'fonts.css would change');
  process.exit(changes.length || !same ? 1 : 0);
}

await writeFile(CSS_PATH, out);
console.log(`${blocks.length} faces written to ${CSS_PATH}`);

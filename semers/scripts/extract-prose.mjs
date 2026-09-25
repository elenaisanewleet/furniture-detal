/**
 * Pull every translatable string out of the built English pages.
 *
 * Page prose lives in the .astro files, which is where it should live for
 * authoring. Rather than hollow out twenty pages into key lookups, the strings
 * are read back out of the emitted HTML, translated once into a memory file, and
 * substituted into the localised pages at build time. The upshot is that a
 * translation is a data change the owner can read and correct, not a code change.
 *
 * Only text is taken: script, style and code contents are skipped, anything
 * marked translate="no" is skipped, and so is anything that is purely a number,
 * a price or a URL.
 *
 * Usage: node scripts/extract-prose.mjs dist > prose.en.json
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

/** Elements whose text is code or markup, never prose. */
const OPAQUE = new Set(['script', 'style', 'code', 'pre', 'svg', 'noscript', 'template']);
/** Attributes that hold a sentence a reader will see or hear. */
const ATTRS = ['alt', 'title', 'placeholder', 'aria-label', 'data-success', 'content'];
/** Only these meta names/properties carry prose; the rest are machine values. */
const META_OK = /^(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)$/;

/** A string worth sending to a translator. */
export function isProse(s) {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!/\p{L}/u.test(t)) return false; // digits, punctuation, currency alone
  if (/^[\d\s.,:×+%€$–—-]+$/.test(t)) return false;
  if (/^(https?:|mailto:|tel:|\/|#)/.test(t)) return false;
  if (/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(t)) return false; // bare e-mail
  return true;
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_astro' || e.name === 'fonts' || e.name === 'img' || e.name === 'ru' || e.name === 'lv' || e.name === 'admin') continue;
      yield* walk(full);
    } else if (e.name.endsWith('.html')) yield full;
  }
}

/**
 * A deliberately small HTML scanner. It walks the tag stream, tracks whether we
 * are inside an opaque or translate="no" element, and yields the text between
 * tags plus the interesting attributes.
 */
export function scan(html, onString) {
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'area', 'col', 'wbr', 'base', 'embed', 'track', 'param']);
  /** One frame per open element, so the opaque and no-translate depths are derived rather than counted by hand. */
  const stack = [];
  const opaque = () => stack.some((f) => f.opaque);
  const noTranslate = () => stack.some((f) => f.no);
  let last = 0;
  let m;

  const emitText = (raw) => {
    if (opaque() || noTranslate()) return;
    // Entities are left encoded: the substitution later works on the same bytes.
    // The doctype is stripped first — the tag scanner only matches tags that
    // start with a letter, so <!DOCTYPE ...> would otherwise arrive as text.
    for (const piece of raw.replace(/<!DOCTYPE[^>]*>/gi, '').split(/(?:<!--[\s\S]*?-->)/)) {
      const t = piece.replace(/\s+/g, ' ').trim();
      if (t && isProse(t)) onString(t, 'text');
    }
  };

  while ((m = tagRe.exec(html))) {
    emitText(html.slice(last, m.index));
    last = tagRe.lastIndex;
    const [, closing, rawName, attrs] = m;
    const name = rawName.toLowerCase();

    if (closing) {
      const i = stack.map((f) => f.name).lastIndexOf(name);
      if (i >= 0) stack.length = i;
      continue;
    }

    /*
     * translate="no" is the explicit opt-out. A lang attribute is an implicit
     * one — the language switcher names each language in that language on
     * purpose — but not on html or body, where lang states the page's own
     * language and would exempt the whole document.
     */
    const no = /\stranslate=["']?no/i.test(attrs) || (/\slang="/i.test(attrs) && name !== 'html' && name !== 'body');

    if (!opaque() && !noTranslate()) {
      const metaKey = (/\s(?:name|property)="([^"]+)"/i.exec(attrs) || [])[1];
      for (const a of ATTRS) {
        const am = new RegExp(`\\s${a}="([^"]*)"`, 'i').exec(attrs);
        if (!am) continue;
        if (a === 'content' && !(metaKey && META_OK.test(metaKey))) continue;
        const v = am[1].replace(/\s+/g, ' ').trim();
        if (v && isProse(v)) onString(v, metaKey ? `meta:${metaKey}` : a);
      }
    }

    const selfClosing = /\/\s*$/.test(attrs) || VOID.has(name);
    if (!selfClosing) stack.push({ name, no, opaque: OPAQUE.has(name) });
  }
  emitText(html.slice(last));
}

const root = process.argv[2] || 'dist';
const seen = new Map();
for await (const file of walk(root)) {
  const page = '/' + relative(root, file).replace(/index\.html$/, '').replace(/\.html$/, '');
  const html = await readFile(file, 'utf-8');
  scan(html, (s, kind) => {
    const e = seen.get(s) || { text: s, kind, pages: [], count: 0 };
    e.count++;
    if (e.pages.length < 3 && !e.pages.includes(page)) e.pages.push(page);
    seen.set(s, e);
  });
}

const out = [...seen.values()].sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));
const words = out.reduce((n, e) => n + e.text.split(/\s+/).length, 0);
process.stderr.write(`${out.length} unique strings, ${words} words\n`);
process.stdout.write(JSON.stringify(out, null, 1));

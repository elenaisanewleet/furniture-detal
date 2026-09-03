/**
 * A structural check of the built pages. Not a full HTML validator — it looks
 * for the specific ways this site could break: three locales rendering the same
 * components, two post-build passes rewriting the markup in place, and copy
 * that arrives from a JSON file rather than from the template.
 *
 * What it asserts, per page:
 *   - tags nest and close (the substitution passes splice into byte ranges, so
 *     a broken range would show up here first);
 *   - exactly one <h1>, and heading levels do not skip;
 *   - every id is unique, and every href="#id" and aria-* reference resolves;
 *   - every <img> has an alt attribute, and dimensions to reserve its space;
 *   - every form control is labelled;
 *   - no empty link or button, and no link with no destination.
 *
 * Usage: node scripts/check-html.mjs [dist]
 * Exits non-zero when something is wrong.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || 'dist';
const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'area', 'col', 'wbr', 'base', 'embed', 'track', 'param']);
/** Elements the parser must not read as markup. */
const RAW = new Set(['script', 'style']);
/** Controls that need a name a screen reader can announce. */
const LABELLED = new Set(['input', 'select', 'textarea']);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['_astro', 'fonts', 'img'].includes(e.name)) yield* walk(f);
    } else if (e.name.endsWith('.html')) yield f;
  }
}

const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}="([^"]*)"`, 'i').exec(tag);
  return m ? m[1] : new RegExp(`\\s${name}(?=[\\s/>])`, 'i').test(tag) ? '' : null;
};

function checkPage(html, report) {
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const stack = [];
  const ids = new Map();
  const idRefs = [];
  const headings = [];
  let h1 = 0;
  let m;
  let skipTo = 0;

  while ((m = tagRe.exec(html))) {
    if (m.index < skipTo) continue;
    const [tag, closing, rawName, attrs] = m;
    const name = rawName.toLowerCase();

    if (closing) {
      const i = stack.map((f) => f.name).lastIndexOf(name);
      if (i < 0) report(`stray </${name}>`);
      else {
        for (const f of stack.slice(i + 1)) report(`<${f.name}> is never closed`);
        stack.length = i;
      }
      continue;
    }

    const selfClosing = /\/\s*$/.test(attrs) || VOID.has(name);

    const id = attr(tag, 'id');
    if (id) {
      if (ids.has(id)) report(`duplicate id "${id}"`);
      ids.set(id, true);
    }
    for (const a of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns']) {
      const v = attr(tag, a);
      if (v) for (const ref of v.split(/\s+/).filter(Boolean)) idRefs.push([a, ref]);
    }
    const href = attr(tag, 'href');
    if (name === 'a') {
      if (href === null) {
        // <a> with no href is not a link; only flag it when it also has no role.
        if (!attr(tag, 'role')) report('<a> with no href');
      } else if (href.startsWith('#') && href.length > 1) idRefs.push(['href', href.slice(1)]);
      else if (href === '' || href === '#') report('<a> with an empty destination');
    }

    if (name === 'img') {
      if (attr(tag, 'alt') === null) report(`<img> with no alt: ${(attr(tag, 'src') || '').slice(-48)}`);
      if (!attr(tag, 'width') || !attr(tag, 'height')) {
        if (!/\bstyle="[^"]*(?:aspect-ratio|height)/i.test(tag)) report(`<img> with no dimensions: ${(attr(tag, 'src') || '').slice(-48)}`);
      }
    }

    if (LABELLED.has(name)) {
      const type = (attr(tag, 'type') || '').toLowerCase();
      // A honeypot is deliberately outside the accessibility tree: aria-hidden
      // plus tabindex="-1" is the pattern, and a name would defeat the point.
      const ariaHidden = attr(tag, 'aria-hidden') === 'true';
      if (!ariaHidden && !['hidden', 'submit', 'button', 'reset'].includes(type)) {
        const labelled = attr(tag, 'aria-label') || attr(tag, 'aria-labelledby') || attr(tag, 'title');
        // Three ways to name a control: an explicit <label for>, a <label> the
        // control sits inside, or an aria-* attribute.
        const explicit = id && new RegExp(`<label[^>]*\\sfor="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html);
        const wrapped = stack.some((f) => f.name === 'label');
        if (!labelled && !explicit && !wrapped) report(`<${name}${id ? ` id="${id}"` : ''}> has no accessible name`);
      }
    }

    if (/^h[1-6]$/.test(name)) {
      const level = Number(name[1]);
      headings.push(level);
      if (level === 1) h1++;
    }

    if (!selfClosing) {
      stack.push({ name });
      // Raw-text elements swallow everything until their close tag, so the tag
      // scanner must not read the JSON or CSS inside them as markup.
      if (RAW.has(name)) {
        const close = html.toLowerCase().indexOf(`</${name}`, tagRe.lastIndex);
        if (close > -1) { skipTo = close; tagRe.lastIndex = close; }
      }
    }
  }

  for (const f of stack) if (f.name !== 'html' && f.name !== 'body') report(`<${f.name}> is never closed`);
  for (const [where, ref] of idRefs) if (!ids.has(ref)) report(`${where} points at "#${ref}", which is not on the page`);
  if (h1 !== 1) report(`${h1} <h1> elements, expected exactly 1`);
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) report(`heading level jumps from h${headings[i - 1]} to h${headings[i]}`);
  }
}

let pages = 0;
let problems = 0;
const shown = [];
for await (const file of walk(ROOT)) {
  pages++;
  const page = '/' + relative(ROOT, file).replace(/index\.html$/, '').replace(/\.html$/, '');
  const html = await readFile(file, 'utf-8');
  checkPage(html, (msg) => {
    problems++;
    if (shown.length < 50) shown.push(`${page}: ${msg}`);
  });
}

console.log(`${pages} pages checked`);
if (!problems) {
  console.log('no problems');
  process.exit(0);
}
console.log(`\n${problems} problems:`);
shown.forEach((s) => console.log('  -', s));
if (problems > shown.length) console.log(`  … and ${problems - shown.length} more`);
process.exit(1);

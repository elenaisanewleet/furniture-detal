/**
 * One HTML scanner, shared by the prose extractor and the prose substituter, so
 * that what gets pulled out for translation and what gets put back are decided
 * by exactly the same rules. If the two ever disagreed, a translated string
 * would silently fail to apply.
 *
 * It reports each translatable run with its byte range, which is what lets the
 * substituter splice replacements in without re-serialising the document.
 *
 * Skipped: the contents of script, style, code, pre, svg, noscript and template;
 * anything inside translate="no"; anything inside an element that declares its
 * own lang (the language switcher names each language in that language), except
 * html and body, whose lang states the page's own language; and strings that are
 * only digits, punctuation, a URL or an e-mail address.
 */

/** Elements whose text is code or markup, never prose. */
export const OPAQUE = new Set(['script', 'style', 'code', 'pre', 'svg', 'noscript', 'template']);
/** Attributes that hold a sentence a reader will see or hear. */
export const ATTRS = ['alt', 'title', 'placeholder', 'aria-label', 'data-success'];
/** Only these meta names carry prose; the rest are machine values. */
export const META_OK = /^(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)$/;
const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'area', 'col', 'wbr', 'base', 'embed', 'track', 'param']);

/** A string worth sending to a translator. */
export function isProse(s) {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!/\p{L}/u.test(t)) return false;
  if (/^[\d\s.,:×+%€$–—-]+$/.test(t)) return false;
  if (/^(https?:|mailto:|tel:|\/|#)/.test(t)) return false;
  if (/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(t)) return false;
  return true;
}

/**
 * Walk `html` and call `onRun({ text, kind, start, end })` for every
 * translatable run, in document order. `text` is whitespace-collapsed and
 * trimmed — the form the memory is keyed by; `start`/`end` bound the original
 * substring so a replacement can be spliced in exactly.
 */
export function scanProse(html, onRun) {
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const stack = [];
  const opaque = () => stack.some((f) => f.opaque);
  const blocked = () => stack.some((f) => f.no);
  let last = 0;
  let m;

  /** Text between tags. Split on comments, and report each piece at its true offset. */
  const emitText = (from, to) => {
    if (opaque() || blocked()) return;
    const raw = html.slice(from, to);
    const partRe = /<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/gi;
    let cursor = 0;
    let skip;
    const pieces = [];
    while ((skip = partRe.exec(raw))) {
      pieces.push([cursor, skip.index]);
      cursor = partRe.lastIndex;
    }
    pieces.push([cursor, raw.length]);
    for (const [a, b] of pieces) {
      const piece = raw.slice(a, b);
      const trimmedStart = piece.length - piece.trimStart().length;
      const trimmedEnd = piece.length - piece.trimEnd().length;
      const inner = piece.slice(trimmedStart, piece.length - trimmedEnd);
      if (!inner) continue;
      const text = inner.replace(/\s+/g, ' ');
      if (!isProse(text)) continue;
      onRun({ text, kind: 'text', start: from + a + trimmedStart, end: from + b - trimmedEnd });
    }
  };

  while ((m = tagRe.exec(html))) {
    emitText(last, m.index);
    last = tagRe.lastIndex;
    const [, closing, rawName, attrs] = m;
    const name = rawName.toLowerCase();

    if (closing) {
      const i = stack.map((f) => f.name).lastIndexOf(name);
      if (i >= 0) stack.length = i;
      continue;
    }

    const no = /\stranslate=["']?no/i.test(attrs) || (/\slang="/i.test(attrs) && name !== 'html' && name !== 'body');

    if (!opaque() && !blocked()) {
      const metaKey = (/\s(?:name|property)="([^"]+)"/i.exec(attrs) || [])[1];
      const attrStart = m.index + 1 + closing.length + rawName.length;
      const wanted = name === 'meta' ? (metaKey && META_OK.test(metaKey) ? ['content'] : []) : ATTRS;
      for (const a of wanted) {
        const am = new RegExp(`\\s${a}="([^"]*)"`, 'i').exec(attrs);
        if (!am) continue;
        const value = am[1];
        const text = value.replace(/\s+/g, ' ').trim();
        if (!text || !isProse(text)) continue;
        // Offset of the value inside the whole document: tag start + attrs offset
        // + the match's offset within attrs + the part of the match before the value.
        const valueOffset = attrStart + am.index + am[0].indexOf('"') + 1;
        onRun({ text, kind: metaKey ? `meta:${metaKey}` : a, start: valueOffset, end: valueOffset + value.length, attr: true });
      }
    }

    const selfClosing = /\/\s*$/.test(attrs) || VOID.has(name);
    if (!selfClosing) stack.push({ name, no, opaque: OPAQUE.has(name) });
  }
  emitText(last, html.length);
}

/**
 * Replace every run whose exact English text is in `memory`. Runs not in the
 * memory are left alone, so an untranslated string stays readable English
 * rather than becoming a blank or a key.
 */
export function applyProse(html, memory) {
  const runs = [];
  scanProse(html, (r) => {
    const hit = memory[r.text];
    if (hit && hit !== r.text) runs.push({ ...r, hit });
  });
  if (!runs.length) return { html, applied: 0 };
  // Spliced back to front so earlier offsets stay valid.
  let out = html;
  for (let i = runs.length - 1; i >= 0; i--) {
    const r = runs[i];
    // An attribute value cannot contain a bare double quote, and text cannot
    // contain a bare < or &; the memory is ours, but escape anyway.
    const safe = r.attr ? r.hit.replace(/&/g, '&amp;').replace(/"/g, '&quot;') : r.hit.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    out = out.slice(0, r.start) + safe + out.slice(r.end);
  }
  return { html: out, applied: runs.length };
}

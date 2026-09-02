#!/usr/bin/env node
/**
 * Preview-only: builds the Semers store (semers/) and mounts it under dist/semers/
 * so every Vercel preview deployment of this repository also serves the shop at
 * <preview-url>/semers/. Production (main) is untouched — the store will get its
 * own Vercel project with Root Directory `semers` (see semers/DEPLOY.md).
 *
 * Runs after the root `astro build`. Active when VERCEL_ENV=preview or
 * SEMERS_PREVIEW=1; otherwise it exits immediately.
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, cpSync, statSync } from 'node:fs';
import { join } from 'node:path';

const active = process.env.SEMERS_PREVIEW === '1' || process.env.VERCEL_ENV === 'preview';
if (!active) {
  console.log('[semers-preview] skipped (not a preview build)');
  process.exit(0);
}

const BASE = '/semers';
const root = process.cwd();
const semers = join(root, 'semers');
const out = join(root, 'dist', 'semers');

const run = (cmd, cwd) => {
  console.log(`[semers-preview] ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, SITE_URL: process.env.SEMERS_SITE_URL || 'https://semers.org' } });
};

if (!existsSync(join(semers, 'node_modules', 'astro'))) run('npm ci --no-audit --no-fund', semers);
run('npx astro build', semers);

// Mount under /semers/: every root-relative URL the site emits gets the prefix.
const PATHS = 'shop|products|checkout|cart|order|api|img|legal|journal|faq|contact|wholesale|story|why-pastila|how-its-made|where-to-buy|fonts|_astro|favicon|site\\.webmanifest|apple-touch-icon|icon-|logo|sitemap|robots';
const rewrite = (text, ext) => {
  let t = text;
  if (ext === '.html' || ext === '.xml' || ext === '.webmanifest') {
    t = t.replace(/(\s(?:href|src|action|poster)=")\/(?!\/)/g, `$1${BASE}/`);
    t = t.replace(/(\s(?:href|src|action|poster)=')\/(?!\/)/g, `$1${BASE}/`);
  }
  // The manifest's start_url ("/?utm_source=pwa") must stay inside the mounted scope, or an installed preview PWA opens the root site.
  if (ext === '.webmanifest') t = t.replace(/("(?:start_url|scope)":\s*")\/(?!\/|semers\/)/g, `$1${BASE}/`);
  if (ext === '.css' || ext === '.html') t = t.replace(/url\(\s*(["']?)\/(?!\/)/g, `url($1${BASE}/`);
  // quoted path literals in scripts (inline and bundled) and in JSON carried by data attributes
  t = t.replace(new RegExp(`(["'\`]|&quot;)/(${PATHS})`, 'g'), `$1${BASE}/$2`);
  return t;
};

const walk = (dir, acc = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
};

const src = join(semers, 'dist');
cpSync(src, out, { recursive: true });
let touched = 0;
for (const file of walk(out)) {
  const ext = file.slice(file.lastIndexOf('.'));
  if (!['.html', '.css', '.js', '.xml', '.webmanifest', '.txt'].includes(ext)) continue;
  const before = readFileSync(file, 'utf8');
  const after = rewrite(before, ext);
  if (after !== before) {
    writeFileSync(file, after);
    touched++;
  }
}
console.log(`[semers-preview] mounted ${walk(out).length} files under ${BASE}/ (${touched} rewritten)`);

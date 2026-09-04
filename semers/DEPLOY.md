# Deploying semers.org

The site lives in the `semers/` folder of this repository and is meant for Vercel (static output + one serverless function).

## 1. Create the Vercel project

1. Vercel → **Add New… → Project** → import this GitHub repository.
2. **Root Directory**: `semers` (click *Edit* next to the root directory and pick the folder).
3. Framework preset: **Astro** (detected automatically). Build command `npm run build`, output `dist` (already in `vercel.json`).
4. Environment variables (Settings → Environment Variables), all optional but recommended:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | `https://semers.org` — canonical origin used for sitemap, JSON-LD and Open Graph |
| `PUBLIC_MAIL`, `PUBLIC_WHOLESALE_MAIL`, `PUBLIC_PHONE`, `PUBLIC_WHATSAPP` | contacts shown on the site (`PUBLIC_WHATSAPP` as international number, e.g. `37120000000`) |
| `PUBLIC_INSTAGRAM`, `PUBLIC_TIKTOK`, `PUBLIC_FACEBOOK`, `PUBLIC_LINKEDIN` | social links (empty = hidden) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | orders/forms delivered to a Telegram chat |
| `RESEND_API_KEY`, `ORDER_TO_EMAIL`, `ORDER_FROM_EMAIL` | orders/forms by e-mail + customer receipt (Resend, verify your sending domain first) |
| `PUBLIC_GOOGLE_VERIFICATION`, `PUBLIC_BING_VERIFICATION` | search-console verification tags |
| `PUBLIC_PLAUSIBLE_DOMAIN` | enables privacy-friendly analytics (`semers.org`) |

5. Deploy. Preview deployments get their own URL automatically; production follows the `main` branch once the pull request is merged.

## 1a. Preview before the project exists

Until the Semers Vercel project is created, every preview deployment of this repository (any branch except `main`) also serves the shop at `<preview-url>/semers/` — the root build runs `scripts/semers-preview.mjs`, which builds `semers/` and mounts it under that path. Production deployments of `main` skip this step, so the furniture site is never affected. The order endpoint is not deployed in that mode; checkout falls back to the pre-filled e-mail.

## 1b. Higgsfield hosting (where the shop runs today)

The live shop is at **https://semers-store.higgsfield.app**, served from a separate
Higgsfield website project rather than from this repository. That project is a copy
of `semers/` with three differences:

* **`package.json`** builds with `bun --bun astro build && bun scripts/pack.mjs`.
* **`scripts/pack.mjs`** rearranges the Astro output into what the platform expects:
  everything in `dist/` moves to `dist/client/`, and `worker/server.js` is copied to
  `dist/server/server.js`.
* **`worker/server.js`** is the Cloudflare Worker — the API (`/api/order`,
  `/api/storefront`, `/api/reviews`, `/api/admin/*`) plus the per-language 404
  fallback. It is the same file as `semers/worker/server.js`; keep the two in step.

**Database.** The project has one Cloudflare D1 database, reachable in the Worker as
`env.DB`. `migrations/0001_init.sql` is the reference shape, but the Worker creates
every table itself on the first request (`ensureSchema`), so a fresh database needs no
manual step. Columns added later are applied by `ALTER TABLE` from the `ADDED_COLUMNS`
list, because `CREATE TABLE IF NOT EXISTS` leaves an existing table alone — SQLite has
no `ADD COLUMN IF NOT EXISTS`, so "already there" is caught and treated as success.

**Secrets** live on the website project, not in this repository, and a change is staged
until the next deploy:

| Secret | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | the only credential for `/admin/`. Without it the back office answers 503 and says so. |
| `ADMIN_SESSION_SECRET` | signs the admin session cookie (HMAC-SHA256). Rotating it logs everyone out, which is how to revoke a session. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | where orders and form messages arrive |
| `RESEND_API_KEY`, `ORDER_TO_EMAIL`, `ORDER_FROM_EMAIL` | orders by e-mail, and the customer's receipt |

**To ship a change:** build and verify here (`npm run verify`), copy `src/`, `public/`,
`worker/`, `migrations/`, `astro.config.mjs` and `scripts/` across to the website project,
push, and deploy. The Worker and the pages deploy together, so a change to either is
one deploy.

Three files belong to the website project and must survive the copy — overwriting
any of them breaks the deploy rather than the page:

| File | Why |
| --- | --- |
| `app/scripts/pack.mjs` | rearranges the Astro output into `dist/client` + `dist/server/server.js`; it exists only there |
| `app/src/app-meta.json` | the Open Graph and marketplace card for the hosting platform |
| `app/app.manifest.json` | declares `"db": true`, which is what binds the D1 database |

`app/package.json` also stays as it is: it builds with `bun --bun astro build && bun
scripts/pack.mjs`, and this repository's build script is a different one.

The old flat `src/pages/*.astro` must be **deleted**, not merged: the localised tree
routes through `src/pages/[...locale]/`, and leaving both in place collides on every
route.

**When the network blocks the clone.** `apps-repos.higgs.ai` is not always reachable
from wherever this repository is being worked on. The hosting platform's own cloud
sandbox is inside that network and has `git`, `curl` and `bun`, so the sync can be
done from there instead: clone this repository from GitHub and the website repository
side by side, copy across, build with `bun --bun astro build && bun scripts/pack.mjs`
exactly as CI does, run the checks over `dist/client`, then push and deploy. Building
before pushing is the point — the deploy ships whatever is on `main`, and there is no
preview stage to catch a broken build.

## 2. Domain

Vercel project → Settings → Domains → add `semers.org` and `www.semers.org` (redirect www → apex). Set the DNS records Vercel shows at your registrar. Keep the old site up until the new one resolves.

## 3. Telegram in two minutes

1. Message `@BotFather` → `/newbot` → copy the token into `TELEGRAM_BOT_TOKEN`.
2. Add the bot to a group (or message it directly), then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the `chat.id` into `TELEGRAM_CHAT_ID`.
3. Redeploy. Place a test order on the preview URL.

## 4. Before launch checklist

- [ ] Final prices in `src/data/products.ts` (search `TODO`).
- [ ] Nutrition values checked against the printed packs.
- [ ] `npm run localize-images` run and `public/img` committed (removes the dependency on the Higgsfield CDN).
- [ ] Legal pages: registration number and street address filled in (`src/pages/legal/*.astro`, search `TODO`).
- [ ] Contacts and socials set (`.env.example` → Vercel env).
- [ ] Google Search Console: verify, submit `https://semers.org/sitemap-index.xml`.
- [ ] Payment provider (Stripe Checkout) when ready — see README.
- [x] Abuse protection for `/api/order`: the endpoint is public and, with Resend configured, e-mails a receipt to whatever address is submitted. It is now limited to 30 submissions an hour per caller (10 for reviews), counted in the database against the edge-set client IP. Far above any real shopper, far below any use worth having. A honeypot hit answers before the allowance is spent, so a bot cannot use up a person's tries, and a limiter that cannot reach its table lets the order through rather than turning a customer away. Add a captcha as well only if that proves insufficient.
- [ ] Russian and Latvian copy read by someone who speaks it. `docs/translation-notes.md` lists the 375 places a translator had to choose between two defensible renderings; the legal pages are worth a lawyer's eye.
- [ ] `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` set on the hosting project (see above). Until `ADMIN_PASSWORD` exists, `/admin/` cannot be logged into at all.
- [x] Order receipts and the newsletter welcome go out in the language the customer was reading, with the money formatted the way that language writes it and every link pointing into that language. The shop's own notification stays English on purpose — one person reads them all — and carries a `Language:` line saying which language to reply in. `MAIL` in `worker/server.js` holds the wording; a key a language has not translated falls back to English rather than sending a blank.

## Back-office check

`npm run check:admin` drives `/admin/` against a stubbed API: the login screen,
each of the four tabs at a desktop and a phone width, approving a review, saving
a price override, and the five different reasons a login can fail. Same
requirements as the checks below — a browser, and not part of `npm run verify`.

The failure messages are the point. Only a 401 means the password was wrong.
`ADMIN_PASSWORD` missing on the host, a database that is gone, or a 500 all used
to be reported as a wrong password, which sends the owner to type it again —
eight more times, until the login limiter locks them out of a door that was
never locked.

## Structured-data check

`npm run check:schema` (part of `npm run verify`) reads the JSON-LD out of the
built pages and asserts what Google actually reads: the required properties per
type, the shape of the values — a price as a bare number, an availability and a
return category from the vocabulary rather than spelled from memory, dates in
ISO form, a GTIN whose check digit adds up — that on-site URLs point at pages
the build produced, and that `@id` references resolve inside their own graph. A
rich result is withheld silently for any of these; the block stays valid JSON
and the page renders either way.

Recommendations are reported apart from errors and do not fail the run, because
a warning is a decision and an error is a bug.

## Accessibility check

`npm run check:a11y` runs axe over a real render of every template, in all three
languages, at 1440 px and 390 px, against WCAG 2.2 AA. It needs a browser and
the rules engine, which the build does not — `npm i -D playwright axe-core &&
npx playwright install chromium`, then `npm run preview` in another terminal —
so it is not part of `npm run verify`; it skips with a message rather than
failing when playwright is absent. Point `PLAYWRIGHT` at an install elsewhere if
this project does not carry its own.

Three languages rather than one because length moves layout: the overlap that
put the add-to-box button on top of the quantity stepper's "+" existed only on
the Russian product page at 390 px.

## Purchase-path check

`npm run check:flow` walks the path a customer walks — product, add to box,
drawer, cart, checkout, submit, thank-you — in all three languages at a desktop
and a phone width, against a stubbed endpoint so nothing is sent anywhere. It
asserts the arithmetic the customer sees (lines add to the subtotal, subtotal
plus shipping is the total), that the order reports the language it was placed
in, that the reference comes back onto the thank-you page and that the box is
emptied afterwards.

The second half is the keyboard: the skip link hands focus to `<main>` rather
than only scrolling to it, every Tab stop shows a ring, the drawer takes focus
and holds it, and Escape closes it and gives focus back to the button that
opened it. Same requirements as the audit above — a browser, and not part of
`npm run verify`.

## Fonts

Four families, self-hosted, no request to Google at runtime. `npm run fonts`
re-fetches the subsets and rewrites the `@font-face` block in
`src/styles/fonts.css`; `npm run fonts:check` reports what would change without
downloading anything.

Fraunces and Instrument Sans carry the Latin, and neither ships a single
Cyrillic glyph — which is why Literata and Inter are there, declared over the
Cyrillic ranges only. Nothing switches them per page: a `@font-face` applies
strictly inside its `unicode-range`, so a Russian sentence with a Latin brand
name in it sets "Semers" in Fraunces and the Russian words in Literata by
itself. Adding a language means adding its subsets to `FAMILIES` in
`scripts/fetch-fonts.mjs`, the new family to the two stacks in
`src/styles/tokens.css` — **before** the metric-matched fallbacks, which are
Georgia and Arial and will otherwise take the glyphs themselves — and its
preload pair to `src/data/fonts.ts`.

## Local development

```bash
cd semers && npm install && npm run dev
```

`npm run build` runs `astro check` (type checks every page) and then builds `dist/`.

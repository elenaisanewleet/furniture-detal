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
`worker/`, `astro.config.mjs` and `scripts/` across to the website project, push, and
deploy. The Worker and the pages deploy together, so a change to either is one deploy.

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
- [ ] Russian and Latvian copy read by someone who speaks it. `docs/translation-notes.md` lists every place a translator had to choose between two defensible renderings; the legal pages are worth a lawyer's eye.
- [ ] `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` set on the hosting project (see above). Until `ADMIN_PASSWORD` exists, `/admin/` cannot be logged into at all.
- [ ] Order receipts go out in English whatever language the customer was reading. Every order now reports that language, so a reply can be written in it by hand; automating it needs Resend templates per language.

## Local development

```bash
cd semers && npm install && npm run dev
```

`npm run build` runs `astro check` (type checks every page) and then builds `dist/`.

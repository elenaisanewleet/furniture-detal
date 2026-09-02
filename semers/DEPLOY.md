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
- [ ] Abuse protection for `/api/order`: the endpoint is public and, with Resend configured, e-mails a receipt to whatever address is submitted. Before heavy marketing, enable rate limiting in front of it (Vercel WAF → Rate Limiting on `/api/*`, or a captcha on the checkout form) so it cannot be scripted as a mail relay.

## Local development

```bash
cd semers && npm install && npm run dev
```

`npm run build` runs `astro check` (type checks every page) and then builds `dist/`.

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
| `RESEND_API_KEY`, `ORDER_TO_EMAIL`, `ORDER_FROM_EMAIL` | orders/forms by e-mail + customer receipt (Resend, verify your sending domain first). `ORDER_TO_EMAIL` is `riga.pastila@gmail.com` (see § 1b) |
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
  `/api/storefront`, `/api/reviews`, `/api/lockers`, `/api/checkout`,
  `/api/paysera/callback`, `/api/admin/*`) plus the per-language 404 fallback.
  It is the same file as `semers/worker/server.js`; keep the two in step.

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
| `RESEND_API_KEY`, `ORDER_FROM_EMAIL` | the sending side of every e-mail: the shop's copy of an order and the customer's receipt |
| `ORDER_TO_EMAIL` | where the shop's copy of every order goes: **`riga.pastila@gmail.com`** (owner, 25.09.2026). Several addresses may be given, comma-separated. This address is for the host only — it is never printed on a page |
| `REPLY_TO_EMAIL` | optional: where a customer's answer to their receipt lands. Set it to the published customer address, `av@semers.org`, so a reply reaches a person rather than the sending address |
| `PAYSERA_PROJECT_ID` | the Paysera project number (Paysera → Projects → your project). With `PAYSERA_PASSWORD` it switches the checkout from "order request" to payment |
| `PAYSERA_PASSWORD` | the project's **sign password** from the same page. It signs every payment request and verifies every callback; treat it as a secret |
| `PAYSERA_TEST` | `1` sends every payment as a Paysera **test** payment (no money moves; the order, the e-mails and the operations push all say TEST). Remove it, or set `0`, to go live |
| `OPS_WEBHOOK_URL`, `OPS_WEBHOOK_SECRET` | optional: where a paid order is pushed for operations (one signed POST per order; see *Payments* below) |

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
| `app/public/logo-semers.svg` | the official Semers mark. **It exists nowhere else** — not in this repository, not in any build — so a copy that overwrites `public/` destroys it |
| `app/src/components/Logo.astro` | renders that file. The version in this repository draws a placeholder apple instead |
| `app/public/favicon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | cut from the official mark. `scripts/make-icons.mjs` regenerates the **placeholder**, not these |
| `app/public/img/` | the photographs, ~110 files. Regenerable — `npm run localize-images` re-fetches them from the CDN and rewrites `images.ts` — but only while those CDN URLs still resolve |

`app/package.json` also stays as it is: it builds with `bun --bun astro build && bun
scripts/pack.mjs`, and this repository's build script is a different one.

This list is not paperwork: copying over it has already cost the site its logo
once. Commit 4c81e5e replaced `public/` wholesale from here, and the official
mark, every icon cut from it and all 72 photographs went with it — the shop ran
a drawn-apple placeholder in its header and favicon for days before anyone
looked. Restore from the last commit that had them (`76c1e18`) if it happens
again.

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

## 1c. Payments (Paysera)

The shop takes payment through **Paysera** (the company's existing contract), using
Paysera's classic WebToPay protocol, version 1.6. There is no Paysera SDK and no
call from the Worker to Paysera: the Worker signs a request, the shopper's browser
carries it to `https://www.paysera.com/pay/`, and Paysera calls back.

**Switching it on.** Set `PAYSERA_PROJECT_ID` and `PAYSERA_PASSWORD` on the host
(§ 1b) and deploy. `/api/storefront` then reports `payments: true`, the checkout
button reads *Pay for the order* / *Оплатить заказ* / *Apmaksāt pasūtījumu*, and the
note under it says the payment happens on Paysera's page. Without both values the
shop behaves exactly as before: the checkout sends an order request and the owner
replies with a payment link by hand.

**What happens on a payment.**

1. `POST /api/checkout` receives only line ids, quantities, the delivery method and
   the customer's details. It prices the cart itself from `/catalog.json` (built
   from `src/data/products.ts` and `src/data/site.ts`) and the owner's admin
   overrides, refuses a hidden or sold-out product by name, **writes the order row
   (status `new`)**, and only then returns the signed Paysera link. A failure to
   write the row refuses the sale ("not-recorded"), because a payment with no order
   behind it is the one outcome worth refusing a sale over.
2. The shopper pays on Paysera. `accepturl` brings them to
   `/<lang>/order/thank-you/?paid=1&ref=<ref>`, which empties the cart;
   `cancelurl` brings them back to `/<lang>/cart/` with the box still packed.
3. Paysera calls `GET` or `POST /api/paysera/callback` with `data` and `ss1`. The
   Worker checks `ss1 = md5(data + PAYSERA_PASSWORD)` (constant-time), decodes
   `data`, checks the project id, finds the order by `orderid`, and checks that
   `amount` (cents) and `currency` are the order's. Status `1` marks the order
   **paid** and records Paysera's `requestid` and whether it was a test. The shop's
   notification (Telegram + `ORDER_TO_EMAIL`), the customer's receipt in their
   language, and the operations push then go out — once: a repeated callback
   changes nothing and sends nothing again, and a late repeat cannot pull a shipped
   order back to paid.

What the callback answers:

| Situation | Answer | Effect |
| --- | --- | --- |
| signature wrong, or another project | `400` | logged; nothing changes |
| status `0`, `2` or `3` (not paid, pending, info) | `200 OK` | audited; the order stays `new` |
| status `1`, amount or currency not the order's | `200 OK` | **not** marked paid; the order gets a `PAYSERA AMOUNT MISMATCH` admin note and one Telegram alert |
| status `1`, no such order | `200 OK` | a `paid` row marked `RECOVERED` is raised and the owner alerted, so the money is never silent |
| status `1`, all good | `200 OK` | paid, notified, pushed |
| our own failure (database, operations push) | `500` | Paysera retries later; the retry sends only what is still owed |

**In the Paysera account**, check once that the project is active, that its website
address is the shop's domain (the accept, cancel and callback URLs are sent with
every request and are built from the address the shopper is on), and that
the payment methods you want (Baltic bank links, cards) are enabled for it. The
payment purpose the shopper sees is `Semers order [order_nr] ([site_name])`, which
Paysera fills in.

**Test first.** Set `PAYSERA_TEST=1`, deploy, and buy something: every message says
TEST, the order row has `pay_test = 1`, and the operations payload carries
`livemode: false`. Then remove `PAYSERA_TEST` and deploy to go live.

**Database.** The Worker adds the columns it needs (`pay_provider`, `pay_ref`,
`pay_test`, `paid_at`, `ops_sent`, `notified_at`) by itself. Tables and columns
from the earlier Stripe draft (`stripe_events`, `stripe_session`, `stripe_intent`)
are no longer used and can stay; `STRIPE_*` secrets can be deleted.

**Operations push.** With `OPS_WEBHOOK_URL` set, every paid order is POSTed there
once as JSON (`source: "semers-store"`, `order_no`, the lines by GTIN, the delivery
method, the Omniva locker id, `payment: { provider: "paysera", ref, test }`,
`livemode`), signed with `OPS_WEBHOOK_SECRET` as
`x-semers-signature = HMAC-SHA256(secret, "<x-semers-timestamp>.<body>")`. A failed
push makes the callback answer 500, so Paysera's retry delivers it later.
`order_no` is unique per order; a receiver that sees one twice can drop it.

## 1d. Delivery and Omniva parcel lockers

The rules live in `src/data/site.ts` → `shipping`, and every copy of them is read
from there (the cart, the checkout, `/catalog.json` the Worker charges from, the
structured data); `npm test` fails if one drifts.

* **Omniva parcel locker** — Latvia, Lithuania, Estonia (`lockerCountries`) at
  `flatRate` (€3.90 until the owner's own Omniva price arrives), free from
  `freeFrom` (€20).
* **Courier** — the EU, at `courierRate`. It is `null` until the owner gives the
  price, and while it is `null` the courier is **not offered anywhere**: the
  checkout lists only the three Baltic countries and says that for the rest of the
  EU the customer should write to the shop, and the Worker refuses a courier order.
  Setting `courierRate` to a number and rebuilding switches it on everywhere at once
  (all 27 EU countries appear in the checkout; lockers stay Baltic-only). It is
  free from the same `freeFrom` — change that in `priceCart` and in the checkout
  if the owner decides the courier threshold differs.
* There is **no pickup**.

**The free-shipping threshold can also be set in the admin**, and a saved admin value
wins over `site.ts`. If the admin's settings were ever saved while the threshold
was €25, D1 still says 25: after deploying, open `/admin/` → settings and check that
"free shipping from" reads **20**.

**The locker picker.** `GET /api/lockers` fetches Omniva's public list,
`https://www.omniva.ee/locations.json`, and keeps it for a day — in each Worker
isolate's memory and, where the host provides one, in the edge cache (Cache API;
on a host where that is a no-op, each new isolate fetches once). It keeps only
parcel machines (`TYPE` `"0"`) in LV, LT and EE, and answers
`[{ id, name, city, address, country }]` sorted by country and name (`id` is
Omniva's `ZIP`). The feed is one large JSON file for all three countries: on a plan with a very small
CPU budget per request (Workers Free, 10 ms) the parse can run out of time, in
which case the checkout simply shows the typed field; on a paid plan it does not
come close. A feed that fails or cannot be read is answered
with yesterday's copy if there is one, otherwise `502` — and the checkout then
replaces the picker with a plain "locker name or address" field and a note, so an
order never waits on Omniva. A chosen locker reaches the order as the address
`Omniva: <name> (<id>)` plus the locker id, which the shop's e-mail
(`Omniva locker ID: …`) and the operations push (`delivery.locker_id`) carry.
The phone number is required at checkout: Omniva texts the locker code to it.

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
- [x] Legal pages: the company name, registration and VAT numbers, and the legal and office addresses come from `site.company` in `src/data/site.ts` (owner, 25.09.2026). One `TODO` is left in the privacy policy: a link to Paysera's own privacy policy.
- [ ] Contacts and socials set (`.env.example` → Vercel env). A `PUBLIC_MAIL` or `PUBLIC_PHONE` set on the host wins over `site.ts`: it must read `av@semers.org` / `+371 22841714`, or be removed — not the old `hello@semers.org`.
- [ ] Google Search Console: verify, submit `https://semers.org/sitemap-index.xml`.
- [ ] Paysera: `PAYSERA_PROJECT_ID`, `PAYSERA_PASSWORD` and `PAYSERA_TEST=1` set; one test purchase end to end (§ 1c); then `PAYSERA_TEST` removed.
- [ ] `ORDER_TO_EMAIL=riga.pastila@gmail.com` and `REPLY_TO_EMAIL=av@semers.org` set on the host (§ 1b).
- [ ] Admin → settings: "free shipping from" reads 20 (§ 1d). The old guarantee line ("…we refund the order — you keep the box") needs no action: a copy of it saved in D1 is read as the new default, so it is never shown again.
- [ ] Omniva: the owner's own parcel-locker price, when it arrives, into `site.shipping.flatRate`; the courier price into `site.shipping.courierRate` (§ 1d).
- [x] Abuse protection for `/api/order`: the endpoint is public and, with Resend configured, e-mails a receipt to whatever address is submitted. It is now limited to 30 submissions an hour per caller (10 for reviews), counted in the database against the edge-set client IP. Far above any real shopper, far below any use worth having. A honeypot hit answers before the allowance is spent, so a bot cannot use up a person's tries, and a limiter that cannot reach its table lets the order through rather than turning a customer away. Add a captcha as well only if that proves insufficient.
- [ ] Russian and Latvian copy read by someone who speaks it. `docs/translation-notes.md` lists the 334 places a translator had to choose between two defensible renderings; the legal pages are worth a lawyer's eye.
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

## Security check

`npm run check:security` (part of `npm run verify`) drives the Worker's own
`fetch` over a real SQLite file standing in for D1 — so what passes is the code
that ships, not a description of it. It tries the locks rather than reading
them: an oversized body (declared and streamed), four kinds of forged cookie,
four writes without the header a cross-site form cannot set, nine wrong
passwords, a shop with no `ADMIN_PASSWORD` at all, six banner links including
`javascript:`, a database that throws on every statement, and thirty-one
submissions in an hour.

Two things it asserts are worth knowing about before an upgrade:

* **Signing out ends the session.** Every issued session is a row in `sessions`,
  and `/api/admin/logout` deletes it. A signature on its own could never be
  taken back — clearing the cookie only affected the device that asked, so a
  token copied off a laptop kept working for the rest of its twelve hours.
  Deploying this **signs the owner out once**: sessions issued before it have no
  row, so the next admin request lands on the login screen. That is the only
  visible effect.
* **The banner link is filtered.** `announcementHref` keeps only a path,
  `https://`, `mailto:` or `tel:`. It is the one owner-typed value that becomes
  a live `href` on every page a visitor loads, so a `javascript:` there would
  turn one admin write into script in every reader's browser. The Worker drops
  it on write and the storefront script drops it again on read.

`/admin/` also refuses to be framed. It is a static file that the Worker never
sees, so there is no response to hang `X-Frame-Options` on: the page hides
itself until it can prove it is the top window, and `npm run check:admin` frames
it both ways to prove that it does.

**The two order endpoints are not the same code.** `worker/server.js` is what
runs today; `api/order.js` is the Vercel function that would run if the project
in step 1 is ever created. Only the Worker has the payment and the locker
endpoints: on Vercel the checkout would take order requests only, and the locker
picker would fall back to its typed field. Both are rate limited now — the Worker counts in D1,
the function in the instance's memory, which is weaker but is the difference
between thirty an hour and as many as a sender cares to send. One gap remains:
the function still sends the shop's own English notification as the customer's
receipt, where the Worker sends a receipt written in the customer's language.
Fix that before pointing semers.org at Vercel.

## Motion check

`npm run check:motion` drives the apple-to-bar sequence on the how-it's-made page — the
one thing on the site that only exists once JavaScript has run and only means
anything if the reader scrolls. It scrolls through the section in all three
languages at a desktop and a phone width and asserts that the silhouette
actually changes (five distinct shapes, five distinct colours), that the five
steps keep pace with it, that the last frame is a bar rather than whatever it
was halfway through, and that the page never scrolls sideways inside it. Then
it loads the page twice more — once with `prefers-reduced-motion: reduce`, once
with JavaScript switched off — and asserts that nothing is pinned, all five
steps are readable as a plain list, and the drawing is resting on the bar.

Needs a browser, so it is not part of `npm run verify`.

The sequence opened the home page until the rebuild; the home page now opens
with the WebGL particle hero (see *Design system and the motion layer*), and
the drawn sequence is the first thing on `/how-its-made/`, where the process
is the subject.

**The flat version is the default and the pinned one is opted into.** `.forge`
is an ordinary section; the script adds `.forge--live` and only then does it
become 320 vh of sticky stage. Written the other way round, a reader with no
JavaScript would get three screens of scroll holding one frozen apple and four
paragraphs at opacity zero. The markup also ships the *last* silhouette as its
static `d`, which is why the no-script page shows a bar.

The five silhouettes live in `src/data/forge.ts` as ordinary SVG outlines — each
starting at top-centre and running clockwise, which is the only thing the morph
needs of them. They are resampled to a shared point count at load, so any of
them can be redrawn in an editor without touching the code.

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
drawer, cart, checkout (finding and choosing an Omniva locker by keyboard),
submit, thank-you — in all three languages at a desktop and a phone width,
against stubbed endpoints so nothing is sent anywhere.

`npm run check:pay` drives the payment half against a stubbed `/api/checkout`
and `/api/lockers`, catching the hand-off to `www.paysera.com` before it leaves
the machine: the button's wording in each language, that only ids and
quantities go up, that the chosen locker reaches the order, the typed fallback
when the list will not load, the cart surviving a cancelled payment and emptied
by a paid one, and every failure said out loud. `DIST=<dir>` points it at a
build other than `dist/`. It
asserts the arithmetic the customer sees (lines add to the subtotal, subtotal
plus shipping is the total), that the order reports the language it was placed
in, that the reference comes back onto the thank-you page and that the box is
emptied afterwards.

The second half is the keyboard: the skip link hands focus to `<main>` rather
than only scrolling to it, every Tab stop shows a ring, the drawer takes focus
and holds it, and Escape closes it and gives focus back to the button that
opened it. Same requirements as the audit above — a browser, and not part of
`npm run verify`.

## Design system and the motion layer

The site is one direction, "the orchard at night": a deep green-black ground,
cream type set very large, and the fruit's own colours — apple red, baked honey,
App'Lite mint — used as light sources rather than fills. Everything visual hangs
off three files, and the names in them are the contract every page is written to:

| File | What it decides |
| --- | --- |
| `src/styles/tokens.css` | the palette (`--night-*`, `--cream-*`, `--apple-500`, `--honey-500`, `--mint-500`…), the **roles** (`--bg`, `--fg`, `--accent`, `--line`…), the type scale up to `--fs-hero`, radii, glows, motion curves. A page never names a hex; it names a role, which is why the whole site changed ground from this one file. |
| `src/styles/base.css` | primitives: type, `.container`/`.section`, buttons (`.btn` cream pill, `.btn--accent`, `.btn--ghost`), forms, the outlined `.marquee`, the reveal hooks, the cursor and grain, the page-enter animation. |
| `src/styles/site.css` | shared components used by more than one page: product card (`.pc`), tiles, steps, comparison (`.vs`), cart drawer, sticky buy bar, journal card, timeline, `.cta-band` (the one cream room on a page), gallery, variant chips, builder. Page-specific styles live in each page's own `<style>`. |

Type is the light: Fraunces (Literata over the Cyrillic ranges) at `--fs-hero`
for the one line a page opens with, an italic `<em>` in the accent for the one
word that matters, and outlined numerals (`-webkit-text-stroke`) for anything
decorative. Photographs are lit windows — rounded frames with a hairline, on the
ground, never on white. Depth is glow and hairline, not shadow.

**Motion** is one script, `src/scripts/motion.ts`, loaded by the layout on every
page. It is an enhancement throughout: with `prefers-reduced-motion: reduce`, on
a coarse pointer, or without JavaScript, the page is simply there. What it provides:

| Hook | Effect |
| --- | --- |
| Lenis + GSAP ScrollTrigger | smooth scrolling synced to the scroll-driven set pieces. `window.semersMotion.stop()` turns the smoothing off, which the check scripts do before they measure scroll positions. |
| `data-words` on a heading | the words rise one after another; the split happens in the browser so the sentence stays one string for the translator. |
| `data-reveal`, `data-stagger` | fade-and-rise on entry, staggered across children. |
| `data-parallax="0.2"` on an image in a clipped wrapper | drifts a fraction as fast as the page. |
| `data-tilt` on a card | 3-D tilt with the pointer. |
| `data-cursor="View"` on anything | the drawn cursor grows and prints the word. |
| `data-count="97"` | the number counts up when it scrolls into view. |

**The hero** is a photograph in a lit frame beside the headline — markup and
CSS, nothing else. It was a three.js point cloud of ~26 000 particles morphing an
apple into a bar across a pinned 230 vh section. That cost 12 of the 45 per cent
of frames the home page was dropping while it scrolled, shipped ~550 KB of
JavaScript, and its fallback never worked: without WebGL the section stayed two
screens tall with the canvas at opacity 0 and the poster at 0.22 behind a radial
mask, so a reader with no WebGL scrolled past two screens of near-empty ground.
The photograph is now simply the hero, at its own height, for everyone.

**Adding a page.** Write it against the roles and the shared classes, open with
one enormous line and air, give it one set piece of its own and keep the rest
quiet, and add the hooks above rather than page-level animation code. Media boxes
must hold their shape without the image — `aspect-ratio` on the wrapper and the
`<img>` positioned `absolute; inset: 0` — because a plain `width: 100%` image can
push a grid item past its frame. Nothing may scroll sideways at 390 px.

**Dependencies.** There are none beyond Astro, its sitemap integration and
sharp. `three`, `gsap` and `lenis` used to be runtime dependencies and had to be
`bun add`-ed into the Higgsfield project by hand; they are gone. The motion layer
is IntersectionObserver and one rAF loop, so a file copy is now the whole sync.

## Brand and fonts

The identity is the owner's existing one, published at semers.org: the
apple-and-wordmark logo in navy (`public/logo-semers.svg`), the deep-green /
orange-red / amber palette, and the faces **Lifehack Sans Medium** (display) and
**PT Sans** (text). `src/styles/tokens.css` carries the palette as roles; the
night ground is the brand's deep green taken down, the accent is the brand
orange with dark type on it, as on the packs.

PT Sans is self-hosted from Google Fonts: `npm run fonts` re-fetches its
subsets (latin, latin-ext, cyrillic, cyrillic-ext, in 400 and 700, upright and
italic) and rewrites the generated `@font-face` block in `src/styles/fonts.css`;
`npm run fonts:check` reports what would change without downloading anything.
Lifehack Sans is not on Google Fonts. Its two subsets — Latin with the Latvian
diacritics, and Cyrillic — were cut from the woff2 semers.org serves and live in
`public/fonts/lifehack-sans-*.woff2`; they are declared by hand *below* the
generated block, in the part the script leaves alone, together with the
metric-matched fallbacks. Neither face has an italic, and `html { font-synthesis:
none }` keeps the browser from shearing one: a word marked `<em>` stands upright
in its accent colour.

## Local development

```bash
cd semers && npm install && npm run dev
```

`npm run build` runs `astro check` (type checks every page) and then builds `dist/`.

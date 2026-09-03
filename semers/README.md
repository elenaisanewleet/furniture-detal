# Semers — online store

Static e-commerce site for **Semers** (SIA Semers Group, Riga): App'Lite Apple Bars, Flourless Bars, PastiLite meringues, Belyov pastila, Belevini zephyr and gift boxes. Built with Astro 7, vanilla CSS and a small TypeScript client; no framework, no CMS, no tracking by default.

```
semers/
├─ api/order.js            Vercel serverless: orders + forms → Telegram / e-mail
├─ public/                 fonts, icons, manifest (and public/img after localize-images)
├─ scripts/                make-icons.mjs, localize-images.mjs
├─ src/
│  ├─ data/                site.ts (contacts, shipping), products.ts (catalog + EANs),
│  │                       images.ts (image manifest), faq.ts, journal.ts, articles/
│  ├─ layouts/Base.astro   <head>, SEO, JSON-LD, header/footer/cart drawer
│  ├─ components/          Header, Footer, ProductCard, CartDrawer, Icon, Logo, Breadcrumbs
│  ├─ pages/               every URL (see below)
│  ├─ scripts/site.ts      cart, drawer, filters, bundle builder, forms, checkout
│  ├─ styles/              tokens.css (design tokens), base.css (primitives), site.css (components)
│  └─ lib/schema.ts        schema.org builders
└─ astro.config.mjs        site URL, sitemap priorities
```

## URLs

| Page | Path |
| --- | --- |
| Home | `/` |
| Shop, collections, bundle builder | `/shop/`, `/shop/<collection>/`, `/shop/build-your-box/` |
| Product | `/products/<slug>/` (flavour variants via `?flavour=`) |
| Why pastila, How it's made, Story | `/why-pastila/`, `/how-its-made/`, `/story/` |
| Where to buy, Wholesale, FAQ, Contact | `/where-to-buy/`, `/wholesale/`, `/faq/`, `/contact/` |
| Journal | `/journal/`, `/journal/<slug>/` |
| Cart, Checkout, Thank you | `/cart/`, `/checkout/`, `/order/thank-you/` (noindex) |
| Legal | `/legal/privacy/`, `/legal/terms/`, `/legal/shipping-returns/` |
| Admin | `/admin/` (password, noindex) |
| Machine | `/sitemap-index.xml`, `/robots.txt`, `/site.webmanifest` |

Every page above also exists at `/ru/<path>` and `/lv/<path>`. English keeps the bare path.

## Run it

```bash
cd semers
npm install
npm run dev          # http://localhost:4321
npm run build        # astro check + static build to dist/
npm run preview
```

## Editing content

* **Products, prices, flavours, EANs** → `src/data/products.ts`. Prices are launch placeholders marked `TODO`; nutrition tables are typical values and must be checked against the pack.
* **Contacts, socials, retailers, shipping threshold** → `src/data/site.ts` (or the `PUBLIC_*` env vars, see `.env.example`).
* **Images** → `src/data/images.ts`. Every visual is referenced by a key. Images currently load from the Higgsfield CDN; before launch run `npm run localize-images` to download them into `public/img/` as optimised WebP plus 480/960/1600 px variants (the script writes the `local:` path and `widths:` back into the manifest, and every `<img>` then gets a `srcset` automatically). Commit the result.
* **FAQ** → `src/data/faq.ts` (rendered on `/faq/`, the home page and product pages with FAQ rich-result markup).
* **Journal** → `src/data/journal.ts` (metadata) + `src/data/articles/<slug>.ts` (HTML body).

## Orders and forms

There is no payment gateway yet, by design. Checkout collects the order and posts it to `/api/order`, which forwards it to Telegram and/or e-mail (Resend) and answers with a reference number; the customer gets a receipt e-mail if Resend is configured. If no channel is configured the browser falls back to a pre-filled `mailto:` so no order is lost. The same endpoint handles the newsletter, contact and wholesale forms.

To add card payments later: create a Stripe Checkout session in `api/order.js` (or a new `api/checkout.js`) from the `items` array and redirect to the returned URL instead of `/order/thank-you/`. The cart line items already carry `id`, `qty` and `price`. Today the endpoint forwards the prices the browser sent, which is fine while every order is confirmed by hand with a payment link; once a card flow charges automatically, recompute prices server-side from the catalogue (export it as JSON for the function) and add rate limiting.

## Languages

The shop is published in English (`/`), Russian (`/ru/`) and Latvian (`/lv/`). English keeps the bare URLs; each page declares the other two with `hreflang`, and the language switcher sits in the header.

There is one set of pages, rendered three times. The words come from three places, in order of how much of the site they cover:

1. **Interface strings** — `src/i18n/ui.ts`. Header, footer, cart, buttons, form labels, error messages. English is the source; a key missing from another locale falls back to English, so a half-finished language is readable rather than broken.
2. **Catalogue copy** — `src/data/copy.data.ts`, keyed by product slug, collection key and English FAQ question. It can only override text fields (`name`, `title`, `hook`, `summary`, `description`, `ingredients`, `allergens`); prices, weights, EANs and nutrition stay in `products.ts`, so a translation cannot change a fact.
3. **Page prose** — `src/i18n/prose.<locale>.json`, a flat map of English string to translated string. Page copy stays written in the `.astro` files, in English, where it is easy to edit; after the build, the strings are swapped in the pages under `/ru/` and `/lv/`. A string missing from the map renders in English.

**To correct a translation**, edit the value in whichever of those three files holds it and rebuild. The prose map is plain JSON keyed by the English sentence, so it can be searched for the wording you saw on the page.

**To re-extract after adding new page copy**, build, then diff what is still English on a localised page against the English original — `scripts/prose-scan.mjs` is the scanner both the extractor and the substituter use, so the two can never disagree about what is translatable. Anything inside `<script>`, `<style>`, `<code>`, `<pre>`, `<svg>` or an element marked `translate="no"` or carrying its own `lang` is left alone.

The legal pages are translated too, and each translated one carries a note saying the English version governs if the two disagree.

Where a translator had to choose between two defensible renderings — «контролёр» or «оператор персональных данных» for the GDPR controller, «постамат» or «пакомат» for a parcel locker — the choice and the reasoning are in `docs/translation-notes.md`, keyed by the English sentence so they can be found and changed. Nothing in that file is a known error: every number, date, deadline and allergen statement was checked against the English before it was committed.

## SEO

Canonical + hreflang (reciprocal, with `x-default`), Open Graph, JSON-LD (`Organization`, `WebSite` with SearchAction, `BreadcrumbList`, `Product`/`ProductGroup` with `Offer` + `gtin13`, `ItemList`, `FAQPage`, `Article`, `HowTo`), sitemap with priorities and `xhtml:link` alternates, `robots.txt`, semantic HTML. The structured data is localised with the page: URLs, breadcrumbs and variant names follow the locale, while `Organization` and `WebSite` keep one identity across all three languages. Add your Search Console token via `PUBLIC_GOOGLE_VERIFICATION`.

`node scripts/check-seo.mjs` reads the built output and fails on a canonical that points elsewhere, hreflang that is not reciprocal, a `lang` that disagrees with the directory, an internal link to a page that was never built, or a sitemap that does not match the indexable set. Run it before a deploy.

See `DEPLOY.md` for hosting.

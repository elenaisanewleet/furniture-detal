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
| Machine | `/sitemap-index.xml`, `/robots.txt`, `/site.webmanifest` |

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
* **Images** → `src/data/images.ts`. Every visual is referenced by a key. Images currently load from the Higgsfield CDN; before launch run `npm run localize-images` to download and optimise them into `public/img/` (the script rewrites `local:` paths automatically). Commit the result.
* **FAQ** → `src/data/faq.ts` (rendered on `/faq/`, the home page and product pages with FAQ rich-result markup).
* **Journal** → `src/data/journal.ts` (metadata) + `src/data/articles/<slug>.ts` (HTML body).

## Orders and forms

There is no payment gateway yet, by design. Checkout collects the order and posts it to `/api/order`, which forwards it to Telegram and/or e-mail (Resend) and answers with a reference number; the customer gets a receipt e-mail if Resend is configured. If no channel is configured the browser falls back to a pre-filled `mailto:` so no order is lost. The same endpoint handles the newsletter, contact and wholesale forms.

To add card payments later: create a Stripe Checkout session in `api/order.js` (or a new `api/checkout.js`) from the `items` array and redirect to the returned URL instead of `/order/thank-you/`. The cart line items already carry `id`, `qty` and `price`.

## SEO

Canonical + hreflang, Open Graph, JSON-LD (`Organization`, `WebSite` with SearchAction, `BreadcrumbList`, `Product`/`ProductGroup` with `Offer` + `gtin13`, `ItemList`, `FAQPage`, `Article`, `HowTo`), sitemap with priorities, `robots.txt`, semantic HTML, `lang="en"` with the brand wordmark marked `translate="no"` so Google Translate handles the rest cleanly. Add your Search Console token via `PUBLIC_GOOGLE_VERIFICATION`.

See `DEPLOY.md` for hosting.

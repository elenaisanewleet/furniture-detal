# Semers store — notes for future sessions

- **The brand already exists.** Semers has an official logo and corporate identity, published at
  https://semers.org (the App'Lite site). Use them; do not invent a new mark or palette.
  - Logo: `public/logo-semers.svg` — the apple-and-wordmark in the brand navy `#1b3892`
    (the semers.org `semers-logo.svg`, optimised). `Logo.astro` renders it as an `<img>`.
  - Colours (from the semers.org stylesheet): deep green `#245b08` / `#293d17`, green `#426225`,
    light green `#9fca77`, orange-red `#f15a22`, amber `#fdb913`, yellow `#ffe600`, tan `#d88351`,
    blue `#004a80`. `src/styles/tokens.css` maps them: the night ground is the deep green taken
    down, `--apple-500` is the orange-red, `--honey-500` the amber, `--leaf-500` the light green.
  - Type: **Lifehack Sans Medium** (display) and **PT Sans** (text), as on semers.org. Lifehack
    Sans is not on Google Fonts: its two subsets live in `public/fonts/lifehack-sans-*.woff2` and
    are declared by hand at the bottom of `src/styles/fonts.css`; `npm run fonts` regenerates only
    the PT Sans block above them. Both faces carry Cyrillic and the Latvian diacritics.
- **Read `PLAN.md` first.** It points at the project's single plan — the Google Doc
  "SEMERS САЙТ — план проекта и журнал работ" — which holds the roadmap, the protocol, the
  handoff, the task cards, the risks and the history, in Russian, for the owner. The owner runs
  both their projects from documents in that shape: read AI START HERE, then HANDOFF, then the
  protocol, then the one task card you need. One task, one verifiable result, a ten-point
  HUMAN REVIEW CARD, and a stop before the next stage. Update the task card, the history and the
  handoff when a piece of work is finished; do not start a second plan anywhere else.
- The live shop is the Higgsfield project (website id `ce8b3b43-da2f-4be4-8d97-05b5b8251797`,
  https://semers-store.higgsfield.app). See `DEPLOY.md` § 1b for the sync and the files that must
  survive it. The project has no runtime dependencies beyond Astro, its sitemap integration and
  sharp, so the sync is a file copy; `three`, `gsap` and `lenis` were removed in September 2026.
- **Payment is Paysera (owner, 25.09.2026).** `worker/server.js` builds the WebToPay request and
  verifies `/api/paysera/callback`; it turns on when PAYSERA_PROJECT_ID and PAYSERA_PASSWORD are set
  in the host's secrets (PAYSERA_TEST=1 for test payments). Until then the checkout falls back to an
  order request visible in `/admin/`. Delivery: Omniva parcel lockers in LV/LT/EE; courier to the
  rest of Europe appears once `site.shipping.courierRate` is set.
- Do not look at or copy from pastila.eu. Internal business figures and client names stay off the site.
- Company details are confirmed and published (owner, 25.09.2026): reg. no. 40203400507, VAT
  LV40203400507, legal address Vēju iela 14, Carnikava; returns to Pildas iela 10, Rīga, LV-1035.
  The bank account (IBAN) is never published. Never mention Belyov anywhere.

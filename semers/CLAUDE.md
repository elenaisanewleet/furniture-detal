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
- **Read `PLAN.md` first.** It is the project plan and work journal, in Russian, for the owner:
  what is done, what is broken, what is waiting on an owner decision, and the next single step.
  Add a line to its journal when you finish a piece of work; record owner decisions in its §4.
- The live shop is the Higgsfield project (website id `ce8b3b43-da2f-4be4-8d97-05b5b8251797`,
  https://semers-store.higgsfield.app). See `DEPLOY.md` § 1b for the sync and the files that must
  survive it. The project has no runtime dependencies beyond Astro, its sitemap integration and
  sharp, so the sync is a file copy; `three`, `gsap` and `lenis` were removed in September 2026.
- **The shop does not take payment yet.** `api/order.js` records an order request and notifies
  Telegram and e-mail; the checkout promises a payment link by hand. Closing that gap is the
  project's next step, and it needs an owner decision on the provider.
- Do not look at or copy from pastila.eu. Internal business figures and client names stay off the site.
- Company registration and VAT numbers are not published until the owner confirms them.

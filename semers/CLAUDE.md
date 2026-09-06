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
- The live shop is the Higgsfield project (website id `ce8b3b43-da2f-4be4-8d97-05b5b8251797`,
  https://semers-store.higgsfield.app). See `DEPLOY.md` § 1b for the sync, the files that must
  survive it, and the dependency note (`three`, `gsap`, `lenis` must be added there with `bun add`).
- Do not look at or copy from pastila.eu. Internal business figures and client names stay off the site.
- Company registration and VAT numbers are not published until the owner confirms them.

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
  "SEMERS САЙТ — план проекта и журнал работ" (id `1RP4du8bTG_eygVD4shvMY1Nt40-cqr_eFgQ3e1ksTBw`
  since 25.09.2026; the old id is an archive) — which holds the rules, the roadmap, the protocol, the
  handoff, the task cards, the risks and the history, in Russian, for the owner. The owner runs
  both their projects from documents in that shape: read AI START HERE, then HANDOFF, then the
  protocol, then the one task card you need. One task, one verifiable result, a ten-point
  HUMAN REVIEW CARD, and a stop before the next stage. Update the task card, the history and the
  handoff when a piece of work is finished; do not start a second plan anywhere else.
- **Hosting is the company's own Cloudflare account** (owner's login smm@semers.org), since
  25.09.2026: Worker `semers-shop` at https://semers-shop.semers-shop.workers.dev, config in
  `wrangler.jsonc`, D1 database `semers-shop`. The network proxy here blocks Cloudflare, so deploys
  run `wrangler login --device` + `wrangler deploy` from the Higgsfield sandbox (it has internet);
  the owner approves the device code. `ADMIN_PASSWORD` is a Worker secret the owner can change in
  the Cloudflare dashboard. The old Higgsfield project (`ce8b3b43-…`, semers-store.higgsfield.app,
  `DEPLOY.md` § 1b) is retired — do not deploy there. Target address: shop.semers.org (DNS for
  semers.org is at Nano IT; the WordPress site semers.org stays there). The project has no runtime dependencies beyond Astro, its sitemap integration and
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

## Правила эффективной работы (строго обязательны)

Главный принцип: получай нужный пользователю результат самым простым достаточным и надёжным
способом. Не путай объём работы с пользой.

1. **Держи фокус на результате.** Перед работой кратко сформулируй задачу и признак её
   завершения. Выполняй текущую задачу; не добавляй функции, инфраструктуру и подготовку «на
   будущее». Если пользователь обсуждает идею — обсуждай; если прямо поручает действие —
   выполняй в согласованных границах.
2. **Сначала ищи простой путь.** Проверь, что уже существует и что умеют используемые
   инструменты. Предпочитай настройку или встроенную функцию, затем готовое решение, затем свой
   код. Не пиши 1 000 строк, если задачу надёжно решают 10. Не подключай большую систему ради
   одной небольшой операции. Выбирай по общим затратам: внедрение, проверка, обслуживание,
   стоимость и риск ошибок; не экономь строки ценой понятности и правильности.
3. **Обосновывай усложнение.** Сложное решение — только из-за конкретного требования или
   проверенного ограничения простого варианта. Перед существенным усложнением объясни, что не
   работает, какие есть варианты и почему выбран этот. Не продолжай неудачный подход только
   потому, что уже потратил на него время.
4. **Работай небольшими завершёнными шагами.** Один шаг — один проверяемый результат. Сначала
   докажи основной сценарий на небольшом примере, затем расширяй. Не начинай следующий этап
   автоматически. Не спрашивай повторно разрешение внутри уже согласованного шага.
5. **Береги существующую работу.** Меняй только необходимое. Соблюдай запреты и границы
   доступа. Перед изменением важных данных обеспечь проверяемый способ восстановления. Не
   переписывай рабочее решение без конкретной причины.
6. **Проверяй соразмерно риску.** Покажи фактическое поведение, а не только файлы и код.
   Проверяй основной сценарий и существенные ошибки. Не повторяй проверки без изменений.
   Отсутствующие сведения не заменяй предположениями; отделяй факт от гипотезы.
7. **Сообщай статус точно и кратко:** что получилось; чем проверено; что осталось или
   ограничивает результат; какой следующий шаг. Не называй «готово» то, что только создано или
   проверено в тестовой среде. Формат отчёта — HUMAN REVIEW CARD из плана, без лишних журналов.
8. **Сохраняй преемственность.** В начале прочитай правила и актуальный Handoff. Одно место для
   плана и истории — Google Документ. После завершённого шага обнови его; если не удалось —
   сообщи. Не заставляй пользователя заново объяснять зафиксированные решения.

**Контроль перед каждым действием:** нужно ли это для текущего результата? можно ли проще? есть
ли разрешение? как я докажу, что это работает? Если действие не даёт необходимого результата или
не обеспечивает его правильность — не выполняй его.

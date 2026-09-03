-- Semers shop schema (Cloudflare D1). Additive only: the same database backs
-- preview and production, so a migration must never drop or rewrite a column.
-- worker/server.js also applies this file's shape with CREATE TABLE IF NOT EXISTS
-- on first request, so the API works even before the deploy runs migrations.

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- One row per submission from /api/order, whatever its type. Orders keep their
-- own columns for the fields the owner sorts and searches by; the untouched
-- request stays in payload_json so nothing a customer sent is ever lost.
CREATE TABLE IF NOT EXISTS orders (
  id           TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL,
  type         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new',
  name         TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  country      TEXT NOT NULL DEFAULT '',
  city         TEXT NOT NULL DEFAULT '',
  postcode     TEXT NOT NULL DEFAULT '',
  address      TEXT NOT NULL DEFAULT '',
  delivery     TEXT NOT NULL DEFAULT '',
  note         TEXT NOT NULL DEFAULT '',
  gift         TEXT NOT NULL DEFAULT '',
  currency     TEXT NOT NULL DEFAULT 'EUR',
  subtotal     REAL NOT NULL DEFAULT 0,
  shipping     REAL NOT NULL DEFAULT 0,
  total        REAL NOT NULL DEFAULT 0,
  items_json   TEXT NOT NULL DEFAULT '[]',
  payload_json TEXT NOT NULL DEFAULT '{}',
  admin_note   TEXT NOT NULL DEFAULT '',
  page         TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS orders_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status  ON orders (status, created_at DESC);

-- Reviews arrive as 'pending' and only reach the storefront once the owner
-- approves them, so the product page can never show text nobody has read.
CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  slug       TEXT NOT NULL,
  rating     INTEGER NOT NULL,
  author     TEXT NOT NULL,
  city       TEXT NOT NULL DEFAULT '',
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending',
  verified   INTEGER NOT NULL DEFAULT 0,
  reply      TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS reviews_slug   ON reviews (slug, status, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_status ON reviews (status, created_at DESC);

-- Per-product edits the owner can make without a redeploy. NULL means "leave
-- whatever the built page says", so an untouched product keeps its source data.
CREATE TABLE IF NOT EXISTS product_overrides (
  slug       TEXT PRIMARY KEY,
  price      REAL,
  compare_at REAL,
  in_stock   INTEGER,
  hidden     INTEGER,
  badge      TEXT,
  batch      TEXT,
  note       TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  email      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT ''
);

-- Failed logins only. Rows older than the window are deleted on each attempt,
-- so this stays a handful of rows rather than a growing log of who tried.
CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT NOT NULL,
  at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS login_attempts_ip ON login_attempts (ip, at);

CREATE TABLE IF NOT EXISTS audit (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  at     TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS audit_at ON audit (at DESC);

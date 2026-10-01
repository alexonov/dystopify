import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS headlines (
  id INTEGER PRIMARY KEY,
  feed_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  guid TEXT,
  link TEXT NOT NULL,
  canonical_link TEXT NOT NULL,
  title TEXT NOT NULL,
  title_key TEXT NOT NULL,
  description TEXT,
  published_at TEXT NOT NULL,
  published_date TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  UNIQUE (feed_id, item_key)
);

CREATE TABLE IF NOT EXISTS scores (
  date TEXT NOT NULL,
  book_id TEXT NOT NULL,
  raw INTEGER NOT NULL,
  score INTEGER NOT NULL,
  matched_count INTEGER NOT NULL,
  headlines_read INTEGER NOT NULL,
  computed_at TEXT NOT NULL,
  PRIMARY KEY (date, book_id)
);

CREATE TABLE IF NOT EXISTS score_themes (
  date TEXT NOT NULL,
  book_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  PRIMARY KEY (date, book_id, theme_id)
);

CREATE TABLE IF NOT EXISTS score_matches (
  date TEXT NOT NULL,
  book_id TEXT NOT NULL,
  title_key TEXT NOT NULL,
  title TEXT NOT NULL,
  weight INTEGER NOT NULL,
  published_at TEXT NOT NULL,
  PRIMARY KEY (date, book_id, title_key)
);

CREATE TABLE IF NOT EXISTS score_match_phrases (
  date TEXT NOT NULL,
  book_id TEXT NOT NULL,
  title_key TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  phrase TEXT NOT NULL,
  weight INTEGER NOT NULL,
  PRIMARY KEY (date, book_id, title_key, theme_id, phrase)
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  items_added INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  ok INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_headlines_date_title
  ON headlines (published_date, title_key);
`;

export function databasePath(): string {
  return path.join(process.cwd(), "data", "dystopify.sqlite");
}

export function migrate(db: Database.Database): void {
  db.exec(SCHEMA);
}

export function openWriteDatabase(): Database.Database {
  mkdirSync(path.dirname(databasePath()), { recursive: true });
  const db = new Database(databasePath());
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  return db;
}

const globalForDb = globalThis as unknown as {
  dystopifyRead?: Database.Database;
};

export function openReadDatabase(): Database.Database | null {
  const file = databasePath();
  try {
    if (!globalForDb.dystopifyRead) {
      const db = new Database(file, { readonly: true, fileMustExist: true });
      db.pragma("query_only = ON");
      db.pragma("busy_timeout = 5000");
      globalForDb.dystopifyRead = db;
    }
    return globalForDb.dystopifyRead;
  } catch {
    return null;
  }
}

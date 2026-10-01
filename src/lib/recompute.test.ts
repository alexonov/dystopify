import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { migrate } from "./db";
import { insertHeadlines, recomputeDate } from "./recompute";
import { titleKey } from "./text";

test("cross-outlet titles score once and descriptions do not score", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "dystopify-"));
  const db = new Database(path.join(dir, "test.sqlite"));
  migrate(db);
  const facial = "Facial recognition expands";
  insertHeadlines(
    db,
    [
      {
        feedId: "bbc-top",
        itemKey: "bbc-1",
        guid: "bbc-1",
        link: "https://www.bbc.co.uk/news/one",
        canonicalLink: "https://www.bbc.co.uk/news/one",
        title: `${facial} - BBC News`,
        titleKey: titleKey(`${facial} - BBC News`),
        description: null,
        publishedAt: "2026-10-01T10:00:00.000Z",
        publishedDate: "2026-10-01",
      },
      {
        feedId: "npr-news",
        itemKey: "npr-1",
        guid: "npr-1",
        link: "https://www.npr.org/one",
        canonicalLink: "https://www.npr.org/one",
        title: facial,
        titleKey: titleKey(facial),
        description: null,
        publishedAt: "2026-10-01T11:00:00.000Z",
        publishedDate: "2026-10-01",
      },
      {
        feedId: "guardian-world",
        itemKey: "g-1",
        guid: "g-1",
        link: "https://www.theguardian.com/weather",
        canonicalLink: "https://www.theguardian.com/weather",
        title: "Weather is calm",
        titleKey: titleKey("Weather is calm"),
        description: "facial recognition is only in the description",
        publishedAt: "2026-10-01T12:00:00.000Z",
        publishedDate: "2026-10-01",
      },
    ],
    "2026-10-01T12:30:00.000Z",
  );

  recomputeDate(db, "2026-10-01", "2026-10-01T12:30:00.000Z");

  const score = db
    .prepare(`SELECT raw, score, matched_count, headlines_read FROM scores WHERE book_id = '1984'`)
    .get() as { raw: number; score: number; matched_count: number; headlines_read: number };
  assert.equal(score.raw, 3);
  assert.equal(score.score, 31);
  assert.equal(score.matched_count, 1);
  assert.equal(score.headlines_read, 2);

  const quiet = db
    .prepare(`SELECT score FROM scores WHERE book_id = 'the-trial'`)
    .get() as { score: number };
  assert.equal(quiet.score, 0);
  db.close();
});

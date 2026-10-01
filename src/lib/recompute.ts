import { books } from "../../data/books";
import type Database from "better-sqlite3";
import { scoreTitleGroups, type TitleGroup } from "./score";

type HeadlineRow = {
  feed_id: string;
  title: string;
  title_key: string;
  published_at: string;
};

export type StoredHeadline = {
  feedId: string;
  itemKey: string;
  guid: string | null;
  link: string;
  canonicalLink: string;
  title: string;
  titleKey: string;
  description: string | null;
  publishedAt: string;
  publishedDate: string;
};

export function insertHeadlines(
  db: Database.Database,
  rows: StoredHeadline[],
  fetchedAt: string,
): number {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO headlines (
      feed_id, item_key, guid, link, canonical_link, title, title_key,
      description, published_at, published_date, fetched_at
    ) VALUES (
      @feedId, @itemKey, @guid, @link, @canonicalLink, @title, @titleKey,
      @description, @publishedAt, @publishedDate, @fetchedAt
    )
  `);
  let added = 0;
  for (const row of rows) {
    const result = insert.run({ ...row, fetchedAt });
    added += result.changes;
  }
  return added;
}

export function deleteOlderThan(db: Database.Database, cutoffDate: string): void {
  db.prepare(`DELETE FROM headlines WHERE published_date < ?`).run(cutoffDate);
  db.prepare(`DELETE FROM scores WHERE date < ?`).run(cutoffDate);
  db.prepare(`DELETE FROM score_themes WHERE date < ?`).run(cutoffDate);
  db.prepare(`DELETE FROM score_matches WHERE date < ?`).run(cutoffDate);
  db.prepare(`DELETE FROM score_match_phrases WHERE date < ?`).run(cutoffDate);
}

export function hasDayMaterial(db: Database.Database, date: string): boolean {
  const headlines = db
    .prepare(`SELECT COUNT(*) AS n FROM headlines WHERE published_date = ?`)
    .get(date) as { n: number };
  const scores = db.prepare(`SELECT COUNT(*) AS n FROM scores WHERE date = ?`).get(date) as {
    n: number;
  };
  return headlines.n > 0 || scores.n > 0;
}

function displayTitle(rows: HeadlineRow[]): string {
  return [...rows].sort((a, b) => b.title.length - a.title.length || a.title.localeCompare(b.title))[0]
    .title;
}

function latestPublished(rows: HeadlineRow[]): string {
  return rows.reduce((latest, row) => (row.published_at > latest ? row.published_at : latest), rows[0].published_at);
}

export function recomputeDate(db: Database.Database, date: string, computedAt: string): void {
  const rows = db
    .prepare(
      `SELECT feed_id, title, title_key, published_at
       FROM headlines
       WHERE published_date = ?`,
    )
    .all(date) as HeadlineRow[];

  const grouped = new Map<string, HeadlineRow[]>();
  for (const row of rows) {
    const list = grouped.get(row.title_key) ?? [];
    list.push(row);
    grouped.set(row.title_key, list);
  }

  const groups: TitleGroup[] = [...grouped.entries()].map(([key, items]) => ({
    titleKey: key,
    titles: items.map((item) => item.title),
    displayTitle: displayTitle(items),
    publishedAt: latestPublished(items),
  }));

  const headlinesRead = groups.length;

  const insertScore = db.prepare(`
    INSERT INTO scores (date, book_id, raw, score, matched_count, headlines_read, computed_at)
    VALUES (@date, @bookId, @raw, @score, @matchedCount, @headlinesRead, @computedAt)
  `);
  const insertTheme = db.prepare(`
    INSERT INTO score_themes (date, book_id, theme_id, points)
    VALUES (@date, @bookId, @themeId, @points)
  `);
  const insertMatch = db.prepare(`
    INSERT INTO score_matches (date, book_id, title_key, title, weight, published_at)
    VALUES (@date, @bookId, @titleKey, @title, @weight, @publishedAt)
  `);
  const insertPhrase = db.prepare(`
    INSERT INTO score_match_phrases (date, book_id, title_key, theme_id, phrase, weight)
    VALUES (@date, @bookId, @titleKey, @themeId, @phrase, @weight)
  `);

  const write = db.transaction(() => {
    db.prepare(`DELETE FROM scores WHERE date = ?`).run(date);
    db.prepare(`DELETE FROM score_themes WHERE date = ?`).run(date);
    db.prepare(`DELETE FROM score_matches WHERE date = ?`).run(date);
    db.prepare(`DELETE FROM score_match_phrases WHERE date = ?`).run(date);

    for (const book of books) {
      const tally = scoreTitleGroups(book, groups);
      insertScore.run({
        date,
        bookId: book.id,
        raw: tally.raw,
        score: tally.score,
        matchedCount: tally.matchedCount,
        headlinesRead,
        computedAt,
      });
      for (const theme of book.themes) {
        insertTheme.run({
          date,
          bookId: book.id,
          themeId: theme.id,
          points: tally.themePoints[theme.id] ?? 0,
        });
      }
      for (const match of tally.matches) {
        insertMatch.run({
          date,
          bookId: book.id,
          titleKey: match.titleKey,
          title: match.title,
          weight: match.weight,
          publishedAt: match.publishedAt,
        });
        for (const hit of match.hits) {
          insertPhrase.run({
            date,
            bookId: book.id,
            titleKey: match.titleKey,
            themeId: hit.themeId,
            phrase: hit.phrase,
            weight: hit.weight,
          });
        }
      }
    }
  });
  write();
}

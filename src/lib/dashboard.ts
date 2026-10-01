import { connection } from "next/server";
import { getBook, books } from "../../data/books";
import { openReadDatabase } from "./db";
import { sourceName } from "./feeds";
import type { Banner, BookScoreView, DayView, HistoryPoint, MatchView } from "./view";

type ScoreRow = {
  date: string;
  book_id: string;
  raw: number;
  score: number;
  matched_count: number;
  headlines_read: number;
};

type ThemeRow = {
  book_id: string;
  theme_id: string;
  points: number;
};

type HistoryRow = {
  date: string;
  book_id: string;
  score: number;
};

type RunRow = {
  finished_at: string;
  error: string | null;
  ok: number;
};

function readBanner(db: NonNullable<ReturnType<typeof openReadDatabase>>): Banner | null {
  const latest = db
    .prepare(
      `SELECT finished_at, error, ok
       FROM runs
       WHERE finished_at IS NOT NULL
       ORDER BY id DESC
       LIMIT 1`,
    )
    .get() as RunRow | undefined;
  if (!latest?.error) return null;
  const success = db
    .prepare(
      `SELECT finished_at
       FROM runs
       WHERE ok = 1 AND finished_at IS NOT NULL
       ORDER BY id DESC
       LIMIT 1`,
    )
    .get() as { finished_at: string } | undefined;
  return {
    failedAt: latest.finished_at,
    error: latest.error,
    lastSuccessAt: success?.finished_at ?? null,
  };
}

function bookViews(
  date: string,
  scoreRows: ScoreRow[],
  themeRows: ThemeRow[],
  historyRows: HistoryRow[],
): BookScoreView[] {
  const scores = new Map(scoreRows.map((row) => [row.book_id, row]));
  const themes = new Map<string, Map<string, number>>();
  for (const row of themeRows) {
    const bookThemes = themes.get(row.book_id) ?? new Map<string, number>();
    bookThemes.set(row.theme_id, row.points);
    themes.set(row.book_id, bookThemes);
  }
  const history = new Map<string, HistoryPoint[]>();
  for (const row of historyRows) {
    if (row.date > date) continue;
    const points = history.get(row.book_id) ?? [];
    points.push({ date: row.date, score: row.score });
    history.set(row.book_id, points);
  }

  return books.flatMap((book) => {
    const score = scores.get(book.id);
    if (!score) return [];
    const themeMap = themes.get(book.id) ?? new Map<string, number>();
    const points = history.get(book.id) ?? [];
    points.sort((a, b) => a.date.localeCompare(b.date));
    return [
      {
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        gloss: book.gloss,
        lens: book.lens,
        raw: score.raw,
        score: score.score,
        matchedCount: score.matched_count,
        headlinesRead: score.headlines_read,
        themes: book.themes.map((theme) => ({
          id: theme.id,
          name: theme.name,
          points: themeMap.get(theme.id) ?? 0,
        })),
        history: points.slice(-7),
      },
    ];
  });
}

export async function loadDay(): Promise<DayView> {
  await connection();
  const db = openReadDatabase();
  if (!db) return { kind: "empty", banner: null };
  const banner = readBanner(db);
  const latest = db.prepare(`SELECT date FROM scores ORDER BY date DESC LIMIT 1`).get() as
    | { date: string }
    | undefined;
  if (!latest) return { kind: "empty", banner };

  const scoreRows = db
    .prepare(
      `SELECT date, book_id, raw, score, matched_count, headlines_read
       FROM scores
       WHERE date = ?`,
    )
    .all(latest.date) as ScoreRow[];
  const themeRows = db
    .prepare(`SELECT book_id, theme_id, points FROM score_themes WHERE date = ?`)
    .all(latest.date) as ThemeRow[];
  const historyRows = db
    .prepare(`SELECT date, book_id, score FROM scores WHERE date <= ? ORDER BY date ASC`)
    .all(latest.date) as HistoryRow[];

  const views = bookViews(latest.date, scoreRows, themeRows, historyRows);
  const catalogOrder = new Map(books.map((book, index) => [book.id, index]));
  const ranked = views
    .filter((book) => book.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (catalogOrder.get(a.id) ?? 0) - (catalogOrder.get(b.id) ?? 0),
    );
  const quiet = views
    .filter((book) => book.score === 0)
    .sort((a, b) => (catalogOrder.get(a.id) ?? 0) - (catalogOrder.get(b.id) ?? 0));
  const headlinesRead = views[0]?.headlinesRead ?? 0;

  return {
    kind: "ready",
    date: latest.date,
    headlinesRead,
    ranked,
    quiet,
    banner,
  };
}

export async function loadBook(id: string): Promise<
  | { kind: "missing" }
  | { kind: "empty"; banner: Banner | null; bookTitle: string }
  | {
      kind: "ready";
      date: string;
      book: BookScoreView;
      matches: MatchView[];
      banner: Banner | null;
    }
> {
  const book = getBook(id);
  if (!book) return { kind: "missing" };
  const day = await loadDay();
  if (day.kind === "empty") return { kind: "empty", banner: day.banner, bookTitle: book.title };

  const entry = [...day.ranked, ...day.quiet].find((item) => item.id === id);
  if (!entry) return { kind: "empty", banner: day.banner, bookTitle: book.title };

  const db = openReadDatabase();
  if (!db) return { kind: "empty", banner: day.banner, bookTitle: book.title };

  const matchRows = db
    .prepare(
      `SELECT title_key, title, weight, published_at
       FROM score_matches
       WHERE date = ? AND book_id = ?
       ORDER BY weight DESC, published_at DESC, title ASC`,
    )
    .all(day.date, id) as {
    title_key: string;
    title: string;
    weight: number;
    published_at: string;
  }[];

  const phraseRows = db
    .prepare(
      `SELECT title_key, theme_id, phrase, weight
       FROM score_match_phrases
       WHERE date = ? AND book_id = ?`,
    )
    .all(day.date, id) as {
    title_key: string;
    theme_id: string;
    phrase: string;
    weight: number;
  }[];

  const titleKeys = matchRows.map((row) => row.title_key);
  const headlines =
    titleKeys.length === 0
      ? []
      : (db
          .prepare(
            `SELECT title_key, feed_id, link, canonical_link, description
             FROM headlines
             WHERE published_date = ?
               AND title_key IN (${titleKeys.map(() => "?").join(", ")})`,
          )
          .all(day.date, ...titleKeys) as {
          title_key: string;
          feed_id: string;
          link: string;
          canonical_link: string;
          description: string | null;
        }[]);

  const themeNames = new Map(book.themes.map((theme) => [theme.id, theme.name]));
  const phrasesByTitle = new Map<string, MatchView["hits"]>();
  for (const row of phraseRows) {
    const hits = phrasesByTitle.get(row.title_key) ?? [];
    hits.push({
      themeName: themeNames.get(row.theme_id) ?? row.theme_id,
      phrase: row.phrase,
      weight: row.weight,
    });
    phrasesByTitle.set(row.title_key, hits);
  }

  const headlinesByTitle = new Map<string, typeof headlines>();
  for (const row of headlines) {
    const list = headlinesByTitle.get(row.title_key) ?? [];
    list.push(row);
    headlinesByTitle.set(row.title_key, list);
  }

  const matches: MatchView[] = matchRows.map((row) => {
    const related = headlinesByTitle.get(row.title_key) ?? [];
    const seen = new Set<string>();
    const links = [];
    let description: string | null = null;
    for (const item of related) {
      if (item.description && (description == null || item.description.length > description.length)) {
        description = item.description;
      }
      if (seen.has(item.canonical_link)) continue;
      seen.add(item.canonical_link);
      links.push({ source: sourceName(item.feed_id), href: item.link });
    }
    links.sort((a, b) => a.source.localeCompare(b.source) || a.href.localeCompare(b.href));
    const hits = (phrasesByTitle.get(row.title_key) ?? []).sort(
      (a, b) => b.weight - a.weight || a.phrase.localeCompare(b.phrase),
    );
    return {
      title: row.title,
      description,
      publishedAt: row.published_at,
      weight: row.weight,
      links,
      hits,
    };
  });

  return { kind: "ready", date: day.date, book: entry, matches, banner: day.banner };
}

import { connection } from "next/server";
import { getBook, books } from "../../data/books";
import { listedHistory } from "./board";
import { openReadDatabase } from "./db";
import { sourceName } from "./feeds";
import type { Banner, BookScoreView, DayView, MatchView } from "./view";
import { combineWindow, formatWindowNote, weekWindows } from "./week";

type ScoreRow = {
  date: string;
  book_id: string;
  raw: number;
  score: number;
  matched_count: number;
  headlines_read: number;
};

type ThemeRow = {
  date: string;
  book_id: string;
  theme_id: string;
  points: number;
};

type RunRow = {
  finished_at: string;
  error: string | null;
  ok: number;
};

function readLastSuccess(db: NonNullable<ReturnType<typeof openReadDatabase>>): string | null {
  const success = db
    .prepare(
      `SELECT finished_at
       FROM runs
       WHERE ok = 1 AND finished_at IS NOT NULL
       ORDER BY id DESC
       LIMIT 1`,
    )
    .get() as { finished_at: string } | undefined;
  return success?.finished_at ?? null;
}

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
  endDate: string,
  scoreRows: ScoreRow[],
  themeRows: ThemeRow[],
  headlinesRead: number,
): BookScoreView[] {
  const { current, previous } = weekWindows(endDate);
  const byDay = new Map(scoreRows.map((row) => [`${row.book_id}\0${row.date}`, row]));
  const currentDates = new Set(current);
  const themes = new Map<string, Map<string, number>>();
  for (const row of themeRows) {
    if (!currentDates.has(row.date)) continue;
    const bookThemes = themes.get(row.book_id) ?? new Map<string, number>();
    bookThemes.set(row.theme_id, (bookThemes.get(row.theme_id) ?? 0) + row.points);
    themes.set(row.book_id, bookThemes);
  }

  return books.map((book) => {
    const currentDays = current.map((date) => {
      const row = byDay.get(`${book.id}\0${date}`);
      return {
        date,
        raw: row?.raw ?? 0,
        score: row?.score ?? 0,
        matched: row?.matched_count ?? 0,
      };
    });
    const previousDays = previous.map((date) => {
      const row = byDay.get(`${book.id}\0${date}`);
      return { raw: row?.raw ?? 0, matched: row?.matched_count ?? 0 };
    });
    const week = combineWindow(currentDays);
    const prior = combineWindow(previousDays);
    const themeMap = themes.get(book.id) ?? new Map<string, number>();
    const history = currentDays.map((day) => ({ date: day.date, score: day.score }));
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year,
      phrase: book.phrase,
      neighbor: book.neighbor,
      raw: week.raw,
      score: week.score,
      matchedCount: week.matched,
      headlinesRead,
      delta: week.score - prior.score,
      themes: book.themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        points: themeMap.get(theme.id) ?? 0,
      })),
      history,
      listedHistory: listedHistory(history),
    };
  });
}

export async function loadDay(): Promise<DayView> {
  await connection();
  const db = openReadDatabase();
  if (!db) return { kind: "empty", banner: null, lastSuccessAt: null };
  const banner = readBanner(db);
  const lastSuccessAt = readLastSuccess(db);
  const latest = db.prepare(`SELECT MAX(published_date) AS date FROM headlines`).get() as
    | { date: string | null }
    | undefined;
  if (!latest?.date) return { kind: "empty", banner, lastSuccessAt };

  const { current, previous } = weekWindows(latest.date);
  const spanStart = previous[0];
  const windowStart = current[0];
  const windowEnd = current[current.length - 1];
  const scoreRows = db
    .prepare(
      `SELECT date, book_id, raw, score, matched_count, headlines_read
       FROM scores
       WHERE date >= ? AND date <= ?`,
    )
    .all(spanStart, windowEnd) as ScoreRow[];
  const themeRows = db
    .prepare(
      `SELECT date, book_id, theme_id, points
       FROM score_themes
       WHERE date >= ? AND date <= ?`,
    )
    .all(windowStart, windowEnd) as ThemeRow[];
  const titles = db
    .prepare(
      `SELECT COUNT(DISTINCT title_key) AS n
       FROM headlines
       WHERE published_date >= ? AND published_date <= ?`,
    )
    .get(windowStart, windowEnd) as { n: number };
  const rows = bookViews(windowEnd, scoreRows, themeRows, titles.n);

  return {
    kind: "ready",
    date: windowEnd,
    windowStart,
    windowEnd,
    note: formatWindowNote(windowStart, windowEnd, titles.n),
    headlinesRead: titles.n,
    rows,
    banner,
    lastSuccessAt,
  };
}

export async function loadBook(id: string): Promise<
  | { kind: "missing" }
  | { kind: "empty"; banner: Banner | null; bookTitle: string; lastSuccessAt: string | null }
  | {
      kind: "ready";
      date: string;
      note: string;
      book: BookScoreView;
      matches: MatchView[];
      banner: Banner | null;
      lastSuccessAt: string | null;
    }
> {
  const book = getBook(id);
  if (!book) return { kind: "missing" };
  const day = await loadDay();
  if (day.kind === "empty") {
    return {
      kind: "empty",
      banner: day.banner,
      bookTitle: book.title,
      lastSuccessAt: day.lastSuccessAt,
    };
  }

  const entry = day.rows.find((item) => item.id === id);
  if (!entry) {
    return {
      kind: "empty",
      banner: day.banner,
      bookTitle: book.title,
      lastSuccessAt: day.lastSuccessAt,
    };
  }

  const db = openReadDatabase();
  if (!db) {
    return {
      kind: "empty",
      banner: day.banner,
      bookTitle: book.title,
      lastSuccessAt: day.lastSuccessAt,
    };
  }

  const matchRows = db
    .prepare(
      `SELECT date, title_key, title, weight, published_at
       FROM score_matches
       WHERE date >= ? AND date <= ? AND book_id = ?
       ORDER BY published_at DESC, weight DESC, title ASC`,
    )
    .all(day.windowStart, day.windowEnd, id) as {
    date: string;
    title_key: string;
    title: string;
    weight: number;
    published_at: string;
  }[];

  const phraseRows = db
    .prepare(
      `SELECT date, title_key, theme_id, phrase, weight
       FROM score_match_phrases
       WHERE date >= ? AND date <= ? AND book_id = ?`,
    )
    .all(day.windowStart, day.windowEnd, id) as {
    date: string;
    title_key: string;
    theme_id: string;
    phrase: string;
    weight: number;
  }[];

  const titleKeys = [...new Set(matchRows.map((row) => row.title_key))];
  const headlines =
    titleKeys.length === 0
      ? []
      : (db
          .prepare(
            `SELECT published_date, title_key, feed_id, link, canonical_link, description
             FROM headlines
             WHERE published_date >= ?
               AND published_date <= ?
               AND title_key IN (${titleKeys.map(() => "?").join(", ")})`,
          )
          .all(day.windowStart, day.windowEnd, ...titleKeys) as {
          published_date: string;
          title_key: string;
          feed_id: string;
          link: string;
          canonical_link: string;
          description: string | null;
        }[]);

  const themeNames = new Map(book.themes.map((theme) => [theme.id, theme.name]));
  const phrasesByTitle = new Map<string, MatchView["hits"]>();
  for (const row of phraseRows) {
    const key = `${row.date}\0${row.title_key}`;
    const hits = phrasesByTitle.get(key) ?? [];
    hits.push({
      themeName: themeNames.get(row.theme_id) ?? row.theme_id,
      phrase: row.phrase,
      weight: row.weight,
    });
    phrasesByTitle.set(key, hits);
  }

  const headlinesByTitle = new Map<string, typeof headlines>();
  for (const row of headlines) {
    const key = `${row.published_date}\0${row.title_key}`;
    const list = headlinesByTitle.get(key) ?? [];
    list.push(row);
    headlinesByTitle.set(key, list);
  }

  const matches: MatchView[] = matchRows.map((row) => {
    const key = `${row.date}\0${row.title_key}`;
    const related = headlinesByTitle.get(key) ?? [];
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
    const hits = (phrasesByTitle.get(key) ?? []).sort(
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

  return {
    kind: "ready",
    date: day.date,
    note: day.note,
    book: entry,
    matches,
    banner: day.banner,
    lastSuccessAt: day.lastSuccessAt,
  };
}

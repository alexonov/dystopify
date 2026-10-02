import { books } from "../data/books";
import { utcDateRangeEnding, utcDateString } from "../src/lib/dates";
import { openWriteDatabase } from "../src/lib/db";
import { scoreEntailment } from "../src/lib/entail";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import {
  GDELT_FEED_ID,
  GDELT_MAX_TITLES,
  GDELT_QUERY,
  dominantTopic,
  gdeltArtListUrl,
  parseGdeltArtList,
  titleFromGkgLine,
} from "../src/lib/gdelt";
import { entailmentPairs, headlineGroups, insertHeadlines, recomputeDate } from "../src/lib/recompute";
import { ENTAILMENT_MIN, entailmentKey } from "../src/lib/score";
import { canonicalLink, itemKey, titleKey } from "../src/lib/text";
import { combineWindow, weekWindows } from "../src/lib/week";
import type { StoredHeadline } from "../src/lib/recompute";

const FLOOR = 0.8;
const GAP_MS = 6500;
const GKG_HOURS = ["000000", "060000", "120000", "180000"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDocDay(day: string): Promise<string> {
  const response = await fetch(gdeltArtListUrl(day), {
    headers: {
      accept: "application/json",
      "user-agent": "Dystopify/0.1 (public headline meter)",
    },
    signal: AbortSignal.timeout(45_000),
  });
  const text = await response.text();
  if (response.status === 429 || text.toLowerCase().includes("limit requests")) {
    throw new Error(`DOC 429 ${text.slice(0, 120)}`);
  }
  if (!response.ok) throw new Error(`DOC HTTP ${response.status} ${text.slice(0, 160)}`);
  return text;
}

function readZipText(zipPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("unzip", ["-p", zipPath], { stdio: ["ignore", "pipe", "pipe"] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(err).toString() || `unzip exited ${code}`));
        return;
      }
      resolve(Buffer.concat(out).toString("utf8"));
    });
  });
}

async function gkgSlice(day: string, hour: string): Promise<{ title: string; url: string; seen: string | null }[]> {
  const stamp = `${day.replaceAll("-", "")}${hour}`;
  const zipPath = `/tmp/gdelt-gkg/${stamp}.gkg.csv.zip`;
  const response = await fetch(`https://data.gdeltproject.org/gdeltv2/${stamp}.gkg.csv.zip`, {
    headers: { "user-agent": "Dystopify/0.1 (public headline meter)" },
    signal: AbortSignal.timeout(60_000),
  });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`${stamp}: HTTP ${response.status}`);
  mkdirSync("/tmp/gdelt-gkg", { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  const { writeFileSync } = await import("node:fs");
  writeFileSync(zipPath, bytes);
  try {
    const text = await readZipText(zipPath);
    const found = [];
    for (const line of text.split("\n")) {
      const item = titleFromGkgLine(line);
      if (item) found.push(item);
    }
    return found;
  } finally {
    rmSync(zipPath, { force: true });
  }
}

function seenDate(day: string, hour: string, precise: string | null): Date {
  const compact = day.replaceAll("-", "");
  if (precise && precise.startsWith(compact)) {
    const year = Number(precise.slice(0, 4));
    const month = Number(precise.slice(4, 6));
    const date = Number(precise.slice(6, 8));
    const hh = Number(precise.slice(8, 10));
    const mm = Number(precise.slice(10, 12));
    const ss = Number(precise.slice(12, 14));
    return new Date(Date.UTC(year, month - 1, date, hh, mm, ss));
  }
  return new Date(`${day}T${hour.slice(0, 2)}:${hour.slice(2, 4)}:${hour.slice(4, 6)}.000Z`);
}

async function pullGkgDay(day: string): Promise<{ titles: string[]; rows: StoredHeadline[] }> {
  const buckets: { title: string; url: string; seen: string | null; hour: string }[][] = [];
  for (const hour of GKG_HOURS) {
    const items = await gkgSlice(day, hour);
    buckets.push(items.map((item) => ({ ...item, hour })));
    console.log(`${day} ${hour}: ${items.length} english titles`);
  }
  const seenKeys = new Set<string>();
  const rows: StoredHeadline[] = [];
  const titles: string[] = [];
  let added = true;
  const cursors = buckets.map(() => 0);
  while (titles.length < GDELT_MAX_TITLES && added) {
    added = false;
    for (let index = 0; index < buckets.length; index += 1) {
      const bucket = buckets[index];
      while (cursors[index] < bucket.length) {
        const item = bucket[cursors[index]];
        cursors[index] += 1;
        const key = titleKey(item.title);
        if (!key || seenKeys.has(key)) continue;
        seenKeys.add(key);
        const canonical = canonicalLink(item.url);
        const published = seenDate(day, item.hour, item.seen);
        titles.push(item.title);
        rows.push({
          feedId: GDELT_FEED_ID,
          itemKey: itemKey(item.url, canonical),
          guid: item.url,
          link: item.url,
          canonicalLink: canonical,
          title: item.title,
          titleKey: key,
          description: null,
          publishedAt: published.toISOString(),
          publishedDate: day,
        });
        added = true;
        break;
      }
      if (titles.length >= GDELT_MAX_TITLES) break;
    }
  }
  return { titles, rows };
}

function booksAbove(db: ReturnType<typeof openWriteDatabase>, endDate: string): number {
  const { current } = weekWindows(endDate);
  const read = db.prepare(`SELECT raw, matched_count AS matched FROM scores WHERE date = ? AND book_id = ?`);
  let above = 0;
  for (const book of books) {
    const days = current.map((date) => {
      const row = read.get(date, book.id) as { raw: number; matched: number } | undefined;
      return { raw: row?.raw ?? 0, matched: row?.matched ?? 0 };
    });
    if (combineWindow(days).score > 0) above += 1;
  }
  return above;
}

async function main(): Promise<void> {
  const today = utcDateString(new Date());
  const days = utcDateRangeEnding(today, 14);
  const pulled: { day: string; titles: string[]; rows: StoredHeadline[] }[] = [];
  let source = "gdelt-doc";
  let docError = "";

  try {
    const body = await fetchDocDay(days[0]);
    const articles = parseGdeltArtList(body, days[0]);
    if (articles.length === 0) throw new Error("DOC artlist returned no articles");
    console.log(`DOC artlist returned ${articles.length} on ${days[0]}`);
    for (let index = 0; index < days.length; index += 1) {
      const day = days[index];
      if (index > 0) await sleep(GAP_MS);
      const text = index === 0 ? body : await fetchDocDay(day);
      const parsed = index === 0 ? articles : parseGdeltArtList(text, day);
      const seenKeys = new Set<string>();
      const rows: StoredHeadline[] = [];
      const titles: string[] = [];
      for (const article of parsed) {
        const key = titleKey(article.title);
        if (!key || seenKeys.has(key)) continue;
        seenKeys.add(key);
        if (titles.length >= GDELT_MAX_TITLES) break;
        const canonical = canonicalLink(article.url);
        titles.push(article.title);
        rows.push({
          feedId: GDELT_FEED_ID,
          itemKey: itemKey(article.url, canonical),
          guid: article.url,
          link: article.url,
          canonicalLink: canonical,
          title: article.title,
          titleKey: key,
          description: null,
          publishedAt: article.seen.toISOString(),
          publishedDate: utcDateString(article.seen),
        });
      }
      console.log(`${day}: doc ${titles.length}`);
      pulled.push({ day, titles, rows });
    }
  } catch (error) {
    docError = error instanceof Error ? error.message : String(error);
    console.error(`DOC artlist stopped: ${docError}`);
    source = "gdelt-gkg";
    pulled.length = 0;
    for (const day of days) {
      const pack = await pullGkgDay(day);
      console.log(`${day}: kept ${pack.titles.length}`);
      pulled.push({ day, titles: pack.titles, rows: pack.rows });
    }
  }

  const allTitles = pulled.flatMap((day) => day.titles);
  const topic = dominantTopic(allTitles);
  if (topic) {
    console.error(`STOP one topic: ${topic.word} in ${Math.round(topic.share * 100)}% of titles`);
    console.log(`SUMMARY ${JSON.stringify({ stopped: true, word: topic.word, share: topic.share, query: GDELT_QUERY })}`);
    process.exitCode = 2;
    return;
  }

  const db = openWriteDatabase();
  try {
    const fetchedAt = new Date().toISOString();
    const added = insertHeadlines(
      db,
      pulled.flatMap((day) => day.rows),
      fetchedAt,
    );
    console.log(`stored ${added}`);

    const maps = new Map<string, Map<string, number>>();
    for (const day of days) {
      const groups = headlineGroups(db, day);
      const pairs = entailmentPairs(groups);
      console.log(`${day}: titles ${groups.length} anchor pairs ${pairs.length}`);
      const scores = await scoreEntailment(pairs);
      maps.set(day, scores);
      recomputeDate(db, day, fetchedAt, scores, ENTAILMENT_MIN);
    }

    let threshold = ENTAILMENT_MIN;
    let above = booksAbove(db, today);
    const zeros = books.length - above;
    console.log(`at ${threshold}: above ${above} zeros ${zeros}`);
    if (zeros > 20) {
      threshold = FLOOR;
      for (const day of days) {
        recomputeDate(db, day, fetchedAt, maps.get(day) ?? new Map(), threshold);
      }
      above = booksAbove(db, today);
      console.log(`at ${threshold}: above ${above} zeros ${books.length - above}`);
    }

    const { current } = weekWindows(today);
    const counted = db
      .prepare(
        `SELECT m.date, m.book_id, m.title, m.title_key, p.theme_id, p.phrase
         FROM score_matches m
         JOIN score_match_phrases p
           ON p.date = m.date AND p.book_id = m.book_id AND p.title_key = m.title_key
         WHERE m.date >= ? AND m.date <= ?
         ORDER BY m.date, m.book_id, m.title`,
      )
      .all(days[0], days[days.length - 1]) as {
      date: string;
      book_id: string;
      title: string;
      title_key: string;
      theme_id: string;
      phrase: string;
    }[];

    const names = new Map(books.map((book) => [book.id, book]));
    const rows = counted.map((row) => {
      const book = names.get(row.book_id);
      const probability = maps.get(row.date)?.get(entailmentKey(row.book_id, row.theme_id, row.title_key)) ?? null;
      return {
        date: row.date,
        book: book?.title ?? row.book_id,
        theme: book?.themes.find((theme) => theme.id === row.theme_id)?.name ?? row.theme_id,
        anchor: row.phrase,
        title: row.title,
        probability,
        inWindow: current.includes(row.date),
        floor: probability != null && probability < ENTAILMENT_MIN,
      };
    });

    const perDay = db
      .prepare(
        `SELECT published_date AS date,
                COUNT(DISTINCT title_key) AS titles,
                COUNT(DISTINCT CASE WHEN feed_id = ? THEN title_key END) AS gdelt
         FROM headlines
         WHERE published_date >= ? AND published_date <= ?
         GROUP BY published_date
         ORDER BY published_date`,
      )
      .all(GDELT_FEED_ID, days[0], days[days.length - 1]) as {
      date: string;
      titles: number;
      gdelt: number;
    }[];

    const summary = {
      query: GDELT_QUERY,
      mode: "artlist",
      source,
      docError,
      urlExample: gdeltArtListUrl(today),
      gkgHours: GKG_HOURS,
      threshold,
      usedFloor: threshold < ENTAILMENT_MIN,
      above,
      zeros: books.length - above,
      days: perDay,
      counted: rows,
    };
    console.log(`RESULT ${JSON.stringify(summary)}`);
  } finally {
    db.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

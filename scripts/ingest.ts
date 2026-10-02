import { feeds } from "../src/lib/feeds";
import { addUtcDays, utcDateString } from "../src/lib/dates";
import { openWriteDatabase } from "../src/lib/db";
import { parseFeed } from "../src/lib/rss";
import { canonicalLink, itemKey, titleKey } from "../src/lib/text";
import { scoreEntailment } from "../src/lib/entail";
import { deleteOlderThan, entailmentPairs, hasDayMaterial, headlineGroups, insertHeadlines, recomputeDate } from "../src/lib/recompute";
import type { StoredHeadline } from "../src/lib/recompute";

const RETENTION_DAYS = 45;

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "user-agent": "Dystopify/0.1 (public RSS headline meter)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function main(): Promise<void> {
  const db = openWriteDatabase();
  const startedAt = new Date().toISOString();
  const run = db.prepare(`INSERT INTO runs (started_at, items_added, ok) VALUES (?, 0, 0)`).run(startedAt);
  const runId = Number(run.lastInsertRowid);
  const failures: string[] = [];
  const rows: StoredHeadline[] = [];

  try {
    for (const feed of feeds) {
      try {
        const xml = await fetchFeed(feed.url);
        const items = parseFeed(xml);
        if (items.length === 0) {
          failures.push(`${feed.id}: parsed 0 items`);
          console.error(`${feed.id}: parsed 0 items`);
          continue;
        }
        for (const item of items) {
          const canonical = canonicalLink(item.link);
          rows.push({
            feedId: feed.id,
            itemKey: itemKey(item.guid, canonical),
            guid: item.guid ?? null,
            link: item.link,
            canonicalLink: canonical,
            title: item.title,
            titleKey: titleKey(item.title),
            description: item.description,
            publishedAt: item.published.toISOString(),
            publishedDate: utcDateString(item.published),
          });
        }
        console.log(`${feed.id}: ${items.length} items`);
      } catch (error) {
        const message = `${feed.id}: ${errorMessage(error)}`;
        failures.push(message);
        console.error(message);
      }
    }

    const error = failures.length > 0 ? failures.join("\n") : null;
    const now = new Date();

    if (rows.length === 0 && failures.length > 0) {
      db.prepare(`UPDATE runs SET finished_at = ?, items_added = 0, error = ?, ok = 0 WHERE id = ?`).run(
        new Date().toISOString(),
        error,
        runId,
      );
      console.log(`SUMMARY ${JSON.stringify({ added: 0, failed: failures, scored: [] })}`);
      process.exitCode = 1;
      return;
    }

    const today = utcDateString(now);
    const yesterday = utcDateString(addUtcDays(now, -1));
    const cutoff = utcDateString(addUtcDays(now, -RETENTION_DAYS));
    const computedAt = new Date().toISOString();
    let added = 0;
    const scored: string[] = [];

    const write = db.transaction(() => {
      added = insertHeadlines(db, rows, computedAt);
      deleteOlderThan(db, cutoff);
    });
    write();
    const todayScores = await scoreEntailment(entailmentPairs(headlineGroups(db, today)));
    recomputeDate(db, today, computedAt, todayScores);
    scored.push(today);
    if (hasDayMaterial(db, yesterday)) {
      const yesterdayScores = await scoreEntailment(entailmentPairs(headlineGroups(db, yesterday)));
      recomputeDate(db, yesterday, computedAt, yesterdayScores);
      scored.push(yesterday);
    }
    db.prepare(`UPDATE runs SET finished_at = ?, items_added = ?, error = ?, ok = ? WHERE id = ?`).run(
      new Date().toISOString(),
      added,
      error,
      error ? 0 : 1,
      runId,
    );
    console.log(`SUMMARY ${JSON.stringify({ added, failed: failures, scored })}`);
    if (failures.length > 0) process.exitCode = 1;
  } catch (error) {
    const message = errorMessage(error);
    db.prepare(`UPDATE runs SET finished_at = ?, error = ?, ok = 0 WHERE id = ?`).run(
      new Date().toISOString(),
      message,
      runId,
    );
    console.error(message);
    console.log(`SUMMARY ${JSON.stringify({ added: 0, failed: [message], scored: [] })}`);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();

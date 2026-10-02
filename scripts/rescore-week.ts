import { writeFileSync } from "node:fs";
import { books, themeRule } from "../data/books";
import { openWriteDatabase } from "../src/lib/db";
import { scoreEntailment } from "../src/lib/entail";
import { entailmentPairs, headlineGroups, recomputeDate } from "../src/lib/recompute";
import { ENTAILMENT_MIN, entailmentKey, matchedAnchors } from "../src/lib/score";
import { combineWindow, weekWindows } from "../src/lib/week";

const CUTOFF = ENTAILMENT_MIN;

async function main(): Promise<void> {
  const db = openWriteDatabase();
  try {
    const latest = db.prepare(`SELECT MAX(published_date) AS date FROM headlines`).get() as { date: string };
    const { current, previous } = weekWindows(latest.date);
    const days = [...previous, ...current];
    const computedAt = new Date().toISOString();
    const judged: {
      date: string;
      book: string;
      theme: string;
      anchor: string;
      title: string;
      probability: number;
      inWindow: boolean;
    }[] = [];

    for (const day of days) {
      const groups = headlineGroups(db, day);
      const pairs = entailmentPairs(groups);
      console.log(`${day}: titles ${groups.length} pairs ${pairs.length}`);
      const scores = await scoreEntailment(pairs);
      recomputeDate(db, day, computedAt, scores, CUTOFF);
      const byKey = new Map(groups.map((group) => [group.titleKey, group]));
      for (const book of books) {
        for (const theme of book.themes) {
          for (const group of groups) {
            const probability = scores.get(entailmentKey(book.id, theme.id, group.titleKey));
            if (probability == null) continue;
            const found = matchedAnchors(group.titles, themeRule(book.id, theme.id)?.anchors ?? []);
            if (found.length === 0) continue;
            judged.push({
              date: day,
              book: book.title,
              theme: theme.name,
              anchor: found[0],
              title: byKey.get(group.titleKey)?.displayTitle ?? group.displayTitle,
              probability,
              inWindow: current.includes(day),
            });
          }
        }
      }
    }

    const read = db.prepare(`SELECT raw, matched_count AS matched FROM scores WHERE date = ? AND book_id = ?`);
    const above = books.filter((book) => {
      const week = combineWindow(
        current.map((date) => {
          const row = read.get(date, book.id) as { raw: number; matched: number } | undefined;
          return { raw: row?.raw ?? 0, matched: row?.matched ?? 0 };
        }),
      );
      return week.score > 0;
    });

    const payload = {
      cutoff: CUTOFF,
      window: current,
      above: above.map((book) => book.title),
      judged: judged.sort((a, b) => b.probability - a.probability || a.date.localeCompare(b.date)),
    };
    writeFileSync("/tmp/rescore-week.json", JSON.stringify(payload, null, 2));
    console.log(`above ${above.length}: ${above.map((book) => book.title).join(", ")}`);
    console.log(`judged ${judged.length}`);
  } finally {
    db.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

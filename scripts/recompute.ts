import { existsSync } from "node:fs";
import { databasePath, openWriteDatabase } from "../src/lib/db";
import { scoreEntailment } from "../src/lib/entail";
import { entailmentPairs, headlineGroups, recomputeDate } from "../src/lib/recompute";

async function main(): Promise<void> {
  if (!existsSync(databasePath())) {
    console.error("No database at data/dystopify.sqlite. Run npm run ingest.");
    process.exitCode = 1;
    return;
  }

  const db = openWriteDatabase();
  try {
    const requested = process.argv.slice(2);
    const dates =
      requested.length > 0
        ? requested
        : (db
            .prepare(
              `SELECT date FROM (
                 SELECT published_date AS date FROM headlines
                 UNION
                 SELECT date FROM scores
               )
               ORDER BY date ASC`,
            )
            .all() as { date: string }[]).map((row) => row.date);
    const computedAt = new Date().toISOString();
    for (const date of dates) {
      const scores = await scoreEntailment(entailmentPairs(headlineGroups(db, date)));
      recomputeDate(db, date, computedAt, scores);
      const rows = db.prepare(`SELECT COUNT(*) AS n FROM scores WHERE date = ?`).get(date) as { n: number };
      const above = db
        .prepare(`SELECT COUNT(*) AS n FROM scores WHERE date = ? AND score > 0`)
        .get(date) as { n: number };
      console.log(`${date} ${rows.n} matched ${above.n}`);
    }
  } finally {
    db.close();
  }
}

main();

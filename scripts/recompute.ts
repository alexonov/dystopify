import { existsSync } from "node:fs";
import { databasePath, openWriteDatabase } from "../src/lib/db";
import { recomputeDate } from "../src/lib/recompute";

function main(): void {
  if (!existsSync(databasePath())) {
    console.error("No database at data/dystopify.sqlite. Run npm run ingest.");
    process.exitCode = 1;
    return;
  }

  const db = openWriteDatabase();
  try {
    const dates = db
      .prepare(
        `SELECT date FROM (
           SELECT published_date AS date FROM headlines
           UNION
           SELECT date FROM scores
         )
         ORDER BY date ASC`,
      )
      .all() as { date: string }[];
    const computedAt = new Date().toISOString();
    for (const { date } of dates) {
      recomputeDate(db, date, computedAt);
      const rows = db.prepare(`SELECT COUNT(*) AS n FROM scores WHERE date = ?`).get(date) as { n: number };
      console.log(`${date} ${rows.n}`);
    }
  } finally {
    db.close();
  }
}

main();

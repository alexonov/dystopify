import type { BookScoreView, HistoryPoint, ThemePoint } from "./view";

export function dayDelta(history: HistoryPoint[]): number | null {
  if (history.length < 2) return null;
  const last = history[history.length - 1].score;
  const previous = history[history.length - 2].score;
  return last - previous;
}

export function formatDelta(delta: number | null): string {
  if (delta == null) return "—";
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function rankBooks(rows: BookScoreView[]): BookScoreView[] {
  return [...rows].sort(
    (a, b) => b.score - a.score || a.year - b.year || a.title.localeCompare(b.title),
  );
}

export function loudestMark(book: BookScoreView): { theme: string; hits: number } | null {
  if (book.matchedCount <= 0) return null;
  let best: ThemePoint | null = null;
  for (const theme of book.themes) {
    if (!best || theme.points > best.points) best = theme;
  }
  if (!best || best.points <= 0) return null;
  return { theme: best.name, hits: book.matchedCount };
}

export function biggestMove(rows: BookScoreView[]): number | null {
  let best: number | null = null;
  for (const row of rows) {
    const delta = dayDelta(row.history);
    if (delta == null) continue;
    if (
      best == null ||
      Math.abs(delta) > Math.abs(best) ||
      (Math.abs(delta) === Math.abs(best) && delta > best)
    ) {
      best = delta;
    }
  }
  return best;
}

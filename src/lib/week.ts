import { formatLongUtcDate, utcDateRangeEnding } from "./dates";
import { scoreFromRaw } from "./score";

export const WEEK_DAYS = 7;

export function weekWindows(endDate: string): { current: string[]; previous: string[] } {
  const span = utcDateRangeEnding(endDate, WEEK_DAYS * 2);
  return {
    previous: span.slice(0, WEEK_DAYS),
    current: span.slice(WEEK_DAYS),
  };
}

export function combineWindow(days: { raw: number; matched: number }[]): {
  raw: number;
  score: number;
  matched: number;
} {
  const raw = days.reduce((sum, day) => sum + day.raw, 0);
  const matched = days.reduce((sum, day) => sum + day.matched, 0);
  return { raw, score: scoreFromRaw(raw), matched };
}

export function formatWindowNote(start: string, end: string, titles: number): string {
  const count = titles.toLocaleString("en-GB");
  return `${formatLongUtcDate(start)} to ${formatLongUtcDate(end)}. ${count} titles.`;
}

export function formatWindowSpan(start: string, end: string): string {
  return `${formatShort(start)}–${formatShort(end)}`;
}

function formatShort(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

import { formatShortUtcDate } from "@/lib/dates";
import type { HistoryPoint } from "@/lib/view";

export function ScoreStrip({
  history,
  label,
  compact = false,
}: {
  history: HistoryPoint[];
  label: string;
  compact?: boolean;
}) {
  if (history.length < 2) return null;

  return (
    <div className={compact ? "" : "mt-3"}>
      {compact ? null : (
        <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Stored days</p>
      )}
      <div
        className={`flex overflow-x-auto ${compact ? "items-end gap-1" : "mt-2 gap-2 pb-1"}`}
        aria-label={`${label} scores on stored days, oldest first`}
      >
        {history.map((point) => (
          <div
            key={point.date}
            className={`flex shrink-0 flex-col items-center ${compact ? "w-3 gap-0.5" : "w-11 gap-1"}`}
            title={`${formatShortUtcDate(point.date)}: ${point.score}`}
          >
            {compact ? null : <span className="text-[11px] tabular-nums">{point.score}</span>}
            <div
              className={`flex w-full items-end bg-muted ${compact ? "h-4" : "h-10"}`}
              aria-hidden="true"
            >
              <div
                className="min-h-0.5 w-full bg-primary"
                style={{ height: `${Math.max(point.score, 0)}%` }}
              />
            </div>
            {compact ? (
              <span className="sr-only">
                {formatShortUtcDate(point.date)} {point.score}
              </span>
            ) : (
              <span className="text-center text-[10px] leading-3 text-muted-foreground">
                {formatShortUtcDate(point.date)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

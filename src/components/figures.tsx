import { dayDelta, formatDelta } from "@/lib/board";
import type { HistoryPoint } from "@/lib/view";
import { Sparkline } from "./sparkline";

export function Figures({
  history,
  score,
  label,
}: {
  history: HistoryPoint[];
  score: number;
  label: string;
}) {
  const delta = dayDelta(history);
  const quiet = score === 0;
  const changeClass = delta != null && delta > 0 ? "text-amber" : delta != null && delta < 0 ? "text-primary" : "";

  return (
    <span className="flex items-center gap-3">
      <Sparkline points={history} />
      <progress
        className={`meter w-24 sm:w-28 ${quiet ? "meter-quiet" : ""}`}
        max={100}
        value={score}
        aria-label={`${label} ${score} percent`}
      />
      <span className={`w-12 text-right font-mono text-sm tabular-nums ${quiet ? "" : "text-primary"}`}>
        {score}%
      </span>
      <span className={`w-8 text-right font-mono text-xs tabular-nums ${changeClass}`}>{formatDelta(delta)}</span>
    </span>
  );
}

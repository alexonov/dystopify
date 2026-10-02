import { formatBoardDate, formatBoardStamp } from "@/lib/dates";
import type { Banner } from "@/lib/view";

export function StatusStrip({
  date,
  headlinesRead,
  lastSuccessAt,
}: {
  date: string | null;
  headlinesRead: number | null;
  lastSuccessAt: string | null;
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-2 font-mono sm:grid-cols-4">
      <div>
        <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">AS OF</dt>
        <dd className="text-sm tabular-nums">{date ? formatBoardDate(date) : "—"}</dd>
      </div>
      <div>
        <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">READ</dt>
        <dd className="text-sm tabular-nums">{headlinesRead ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">INGEST</dt>
        <dd className="text-sm tabular-nums">{lastSuccessAt ? formatBoardStamp(lastSuccessAt) : "—"}</dd>
      </div>
      <div>
        <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">MARK</dt>
        <dd className="text-sm tracking-wide">NOT A FORECAST</dd>
      </div>
    </dl>
  );
}

export function FaultLine({ banner }: { banner: Banner | null }) {
  if (!banner) return null;
  const lines = banner.error.split("\n").filter(Boolean);
  return (
    <section className="border border-amber/50 bg-amber/10 px-2 py-2 font-mono text-xs text-amber" role="alert">
      <p>
        INGEST FAIL {formatBoardStamp(banner.failedAt)}
        <span className="ml-3 text-foreground">
          LAST OK {banner.lastSuccessAt ? formatBoardStamp(banner.lastSuccessAt) : "NONE"}
        </span>
      </p>
      <ul className="mt-1 space-y-0.5 text-foreground">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

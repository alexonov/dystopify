import { formatBoardStamp } from "@/lib/dates";
import { formatDelta } from "@/lib/board";
import type { Banner } from "@/lib/view";

export function StatusStrip({
  date,
  titlesRead,
  awake,
  move,
}: {
  date: string | null;
  titlesRead: number | null;
  awake: number | null;
  move: number | null;
}) {
  return (
    <div className="space-y-1">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-2 font-mono sm:grid-cols-4">
        <div>
          <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">AS OF</dt>
          <dd className="text-sm tabular-nums">{date ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">TITLES</dt>
          <dd className="text-sm tabular-nums">{titlesRead ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">AWAKE</dt>
          <dd className="text-sm tabular-nums">{awake ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.18em] text-muted-foreground">MOVE</dt>
          <dd className="text-sm tabular-nums">{titlesRead == null ? "—" : formatDelta(move)}</dd>
        </div>
      </dl>
      <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
        This is pressure in today&apos;s headlines.
      </p>
    </div>
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

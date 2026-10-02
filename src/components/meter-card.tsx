import Image from "next/image";
import Link from "next/link";
import { coverSrc, tickerFor } from "@/lib/symbols";
import type { BookScoreView, HistoryPoint } from "@/lib/view";

function dayChange(history: HistoryPoint[], score: number): { label: string; tone: "up" | "down" | "flat" } {
  if (history.length < 2) return { label: "—", tone: "flat" };
  const delta = score - history[history.length - 2].score;
  if (delta > 0) return { label: `+${delta}`, tone: "up" };
  if (delta < 0) return { label: String(delta), tone: "down" };
  return { label: "0", tone: "flat" };
}

function changeClass(tone: "up" | "down" | "flat"): string {
  if (tone === "up") return "text-amber";
  if (tone === "down") return "text-primary";
  return "text-muted-foreground";
}

export function MeterCard({ book, quiet = false }: { book: BookScoreView; quiet?: boolean }) {
  const change = dayChange(book.history, book.score);
  const ticker = tickerFor(book.id);

  return (
    <Link
      href={`/books/${book.id}`}
      className={`grid gap-3 border border-border bg-card p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/60 ${
        quiet ? "grid-cols-[4.5rem_1fr]" : "grid-cols-[5.5rem_1fr] sm:grid-cols-[8rem_1fr]"
      }`}
    >
      <Image
        src={coverSrc(book.id)}
        alt=""
        width={768}
        height={1152}
        className={`aspect-[2/3] w-full object-cover ${quiet ? "opacity-80" : ""}`}
      />
      <span className="flex min-w-0 flex-col justify-between py-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-xs tracking-[0.22em]">{ticker}</span>
          <span className={`font-mono text-xs tabular-nums ${changeClass(change.tone)}`}>{change.label}</span>
        </span>
        <span
          className={`font-mono leading-none tabular-nums ${
            quiet ? "text-3xl text-muted-foreground" : "text-4xl text-primary sm:text-5xl"
          }`}
        >
          {book.score}%
        </span>
        <progress
          className={`meter ${quiet ? "meter-quiet" : ""}`}
          max={100}
          value={book.score}
          aria-label={`${book.title} ${book.score} percent`}
        />
        <span className="truncate font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          {book.title}
        </span>
      </span>
    </Link>
  );
}

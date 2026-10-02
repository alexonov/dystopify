import Link from "next/link";
import { loudestMark } from "@/lib/board";
import type { BookScoreView } from "@/lib/view";
import { Figures } from "./figures";

export function RankRow({ book, rank }: { book: BookScoreView; rank: number }) {
  const mark = loudestMark(book);
  const quiet = book.score === 0;

  return (
    <li className={quiet ? "text-muted-foreground" : undefined}>
      <Link
        href={`/books/${book.id}`}
        className="block border-b border-border py-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="grid min-w-0 flex-1 grid-cols-[1.75rem_2.75rem_minmax(0,1fr)] items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-xs tabular-nums">{String(rank).padStart(2, "0")}</span>
            <span className="font-mono text-xs tabular-nums">{book.year}</span>
            <span className={`min-w-0 ${quiet ? "" : "text-foreground"}`}>{book.title}</span>
            <span className="col-start-3 text-[11px] leading-4 text-muted-foreground">{book.phrase}</span>
            {mark ? (
              <span className="col-start-3 font-mono text-[10px] tracking-wide text-amber">
                {mark.theme} · {mark.hits}
              </span>
            ) : null}
          </span>
          <Figures history={book.history} score={book.score} label={book.title} />
        </span>
      </Link>
    </li>
  );
}

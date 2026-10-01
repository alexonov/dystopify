import Link from "next/link";
import { ScoreStrip } from "@/components/score-strip";
import type { BookScoreView } from "@/lib/view";

function scoreClass(score: number): string {
  if (score <= 0) return "text-muted-foreground";
  if (score >= 31) return "text-primary";
  return "text-foreground";
}

export function RankedBooks({ books }: { books: BookScoreView[] }) {
  if (books.length === 0) return null;

  return (
    <ol className="divide-y divide-border border-y border-border">
      {books.map((book, index) => (
        <li key={book.id}>
          <Link
            href={`/books/${book.id}`}
            className="group grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-x-4"
          >
            <span className="pt-1 font-mono text-xs text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-2xl leading-tight tracking-tight group-hover:text-primary sm:text-[1.75rem]">
                {book.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{book.gloss}</span>
            </span>
            <span
              className={`font-heading text-4xl leading-none tabular-nums sm:text-5xl ${scoreClass(book.score)}`}
              aria-label={`${book.title} score ${book.score} out of 100`}
            >
              {book.score}
            </span>
            <span className="col-span-2 col-start-2">
              <span className="block h-1.5 w-full bg-muted" aria-hidden="true">
                <span className="block h-full bg-primary" style={{ width: `${book.score}%` }} />
              </span>
              <ScoreStrip history={book.history} label={book.title} />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function QuietBooks({ books }: { books: BookScoreView[] }) {
  if (books.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl tracking-tight">Quiet today</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
        Score 0. No listed phrase matched a headline dated this UTC day.
        {books.some((book) => book.history.length > 1)
          ? " The marks beside a title are that book's stored days, oldest first."
          : ""}
      </p>
      <ul className="mt-3 divide-y divide-border border-y border-border">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              href={`/books/${book.id}`}
              className="flex items-center justify-between gap-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="font-heading text-xl leading-tight">{book.title}</span>
              <span className="flex items-center gap-3">
                <ScoreStrip history={book.history} label={book.title} compact />
                <span className="w-6 text-right text-sm tabular-nums text-muted-foreground">0</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

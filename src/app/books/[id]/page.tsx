import type { Metadata } from "next";
import Link from "next/link";
import { bookByTitle, getBook } from "../../../../data/books";
import { Figures } from "@/components/figures";
import { MissingBook } from "@/components/missing-book";
import { FaultLine, StatusStrip } from "@/components/status-strip";
import { biggestMove, rankBooks } from "@/lib/board";
import { formatBoardDate, formatTapeTime } from "@/lib/dates";
import { loadBook, loadDay } from "@/lib/dashboard";
import { scoreFromRaw } from "@/lib/score";
import type { BookScoreView, MatchView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  if (!book) return { title: "Unknown" };
  return { title: book.title, description: book.phrase };
}

function Tape({ matches }: { matches: MatchView[] }) {
  const rows = matches.flatMap((match) => {
    const hits = match.hits.length > 0 ? match.hits : [{ phrase: "—", themeName: "", weight: match.weight }];
    const links = match.links.length > 0 ? match.links : [{ source: "—", href: "" }];
    return hits.flatMap((hit) =>
      links.map((link) => ({
        key: `${match.publishedAt}-${hit.themeName}-${hit.phrase}-${link.href}`,
        time: formatTapeTime(match.publishedAt),
        source: link.source,
        phrase: hit.phrase,
        theme: hit.themeName,
        title: match.title,
        href: link.href,
      })),
    );
  });

  if (rows.length === 0) {
    return <p className="border-y border-border px-2 py-2 font-mono text-xs tracking-[0.16em] text-muted-foreground">NO HITS</p>;
  }

  return (
    <ul className="border-y border-border">
      {rows.map((row) => (
        <li key={row.key} className="grid gap-1 border-b border-border px-2 py-1.5 font-mono text-xs last:border-b-0 sm:grid-cols-[3.5rem_1fr_9rem_10rem_7rem] sm:items-baseline sm:gap-3">
          <span className="tabular-nums text-muted-foreground">{row.time}</span>
          {row.href ? (
            <a href={row.href} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-2">
              {row.title}
            </a>
          ) : (
            <span>{row.title}</span>
          )}
          <span className="uppercase text-muted-foreground">{row.theme}</span>
          <span className="text-amber">“{row.phrase}”</span>
          <span>{row.source}</span>
        </li>
      ))}
    </ul>
  );
}

function Panel({ book, date, matches }: { book: BookScoreView; date: string; matches: MatchView[] }) {
  const catalog = getBook(book.id);
  const neighbor = bookByTitle(book.neighbor);

  return (
    <div className="space-y-5">
      <div className="space-y-2 border-b border-border pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tabular-nums text-muted-foreground">{book.year}</p>
            <h1 className="text-xl sm:text-2xl">{book.title}</h1>
            <p className="text-sm text-muted-foreground">{book.phrase}</p>
          </div>
          <Figures history={book.history} score={book.score} label={book.title} />
        </div>
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">{formatBoardDate(date)} UTC</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">THEMES</h2>
        <ul className="space-y-3">
          {book.themes.map((theme) => {
            const percent = scoreFromRaw(theme.points);
            return (
              <li key={theme.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3 font-mono text-xs">
                  <span className="min-w-0">{theme.name}</span>
                  <span className="tabular-nums">{percent}%</span>
                </div>
                <progress className="meter" max={100} value={percent} aria-label={`${theme.name} ${percent} percent`} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">TAPE</h2>
        <Tape matches={matches} />
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">HISTORY</h2>
        <ul className="border-y border-border">
          {book.history.map((point) => (
            <li key={point.date} className="flex items-baseline justify-between border-b border-border px-2 py-1 font-mono text-xs last:border-b-0">
              <span className="text-muted-foreground">{formatBoardDate(point.date)}</span>
              <span className="tabular-nums">{point.score}%</span>
            </li>
          ))}
        </ul>
      </section>

      {catalog ? (
        <section className="space-y-3">
          <h2 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">RUBRIC</h2>
          <ul className="space-y-3">
            {catalog.themes.map((theme) => (
              <li key={theme.id}>
                <p className="font-mono text-xs">{theme.name}</p>
                <ul className="mt-1">
                  {theme.phrases.map((phrase) => (
                    <li key={phrase.text} className="flex justify-between gap-3 border-b border-border py-0.5 font-mono text-[11px] text-muted-foreground">
                      <span>{phrase.text}</span>
                      <span className="tabular-nums">{phrase.weight}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="font-mono text-xs text-muted-foreground">
        Beside{" "}
        {neighbor ? (
          <Link href={`/books/${neighbor.id}`} className="text-foreground underline decoration-border underline-offset-2">
            {book.neighbor}
          </Link>
        ) : (
          book.neighbor
        )}
        .
      </p>
    </div>
  );
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getBook(id)) return <MissingBook />;

  const loaded = await loadBook(id);
  if (loaded.kind === "missing") return <MissingBook />;

  const day = loaded.kind === "ready" ? await loadDay() : null;
  const rows = day && day.kind === "ready" ? rankBooks(day.rows) : [];
  const matched = rows.filter((book) => book.score > 0).length;

  return (
    <main className="space-y-3">
      <Link
        href="/"
        className="inline-block font-mono text-[10px] tracking-[0.22em] text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        BOARD
      </Link>
      <FaultLine banner={loaded.banner} />
      {loaded.kind === "empty" ? (
        <>
          <StatusStrip date={null} titlesRead={null} matched={null} move={null} />
          <p className="border border-border px-3 py-6 text-center font-mono text-sm tracking-[0.22em]">NO RUN</p>
        </>
      ) : (
        <>
          <StatusStrip
            date={formatBoardDate(loaded.date)}
            titlesRead={loaded.book.headlinesRead}
            matched={matched}
            move={biggestMove(rows)}
          />
          <Panel book={loaded.book} date={loaded.date} matches={loaded.matches} />
        </>
      )}
    </main>
  );
}

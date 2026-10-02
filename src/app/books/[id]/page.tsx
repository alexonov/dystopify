import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { scoreFromRaw } from "@/lib/score";
import { coverSrc, tickerFor } from "@/lib/symbols";
import { formatBoardDate, formatTapeTime } from "@/lib/dates";
import { loadBook } from "@/lib/dashboard";
import { getBook } from "../../../../data/books";
import { MissingBook } from "@/components/missing-book";
import { FaultLine, StatusStrip } from "@/components/status-strip";
import type { BookScoreView, HistoryPoint, MatchView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  if (!book) return { title: "Unknown" };
  return { title: book.title, description: book.lens };
}

function dayChange(history: HistoryPoint[], score: number): { label: string; tone: "up" | "down" | "flat" } {
  if (history.length < 2) return { label: "—", tone: "flat" };
  const delta = score - history[history.length - 2].score;
  if (delta > 0) return { label: `+${delta}`, tone: "up" };
  if (delta < 0) return { label: String(delta), tone: "down" };
  return { label: "0", tone: "flat" };
}

function Tape({ matches }: { matches: MatchView[] }) {
  const rows = matches.flatMap((match) => {
    const hits = match.hits.length > 0 ? match.hits : [{ phrase: "—", themeName: "", weight: match.weight }];
    const links = match.links.length > 0 ? match.links : [{ source: "—", href: "" }];
    return hits.flatMap((hit) =>
      links.map((link) => ({
        key: `${match.publishedAt}-${hit.phrase}-${link.href}`,
        time: formatTapeTime(match.publishedAt),
        source: link.source,
        phrase: hit.phrase,
        title: match.title,
        href: link.href,
      })),
    );
  });

  if (rows.length === 0) {
    return <p className="border-y border-border px-2 py-2 font-mono text-xs tracking-[0.16em] text-muted-foreground">NO HITS</p>;
  }

  return (
    <div className="overflow-x-auto border-y border-border">
      <ul>
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex min-w-max items-baseline gap-4 border-b border-border px-2 py-1.5 font-mono text-xs last:border-b-0"
          >
            <span className="w-12 tabular-nums text-muted-foreground">{row.time}</span>
            <span className="w-28 uppercase">{row.source}</span>
            <span className="text-amber">“{row.phrase}”</span>
            {row.href ? (
              <a href={row.href} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-2">
                {row.title}
              </a>
            ) : (
              <span>{row.title}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({ book, date, matches }: { book: BookScoreView; date: string; matches: MatchView[] }) {
  const change = dayChange(book.history, book.score);
  const changeClass =
    change.tone === "up" ? "text-amber" : change.tone === "down" ? "text-primary" : "text-muted-foreground";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[6.5rem_1fr] gap-3 sm:grid-cols-[11rem_1fr] sm:gap-5">
        <Image
          src={coverSrc(book.id)}
          alt=""
          width={768}
          height={1152}
          className="aspect-[2/3] w-full object-cover"
          priority
        />
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.24em] text-muted-foreground">{tickerFor(book.id)}</p>
          <h1 className="mt-1 font-mono text-lg tracking-wide uppercase sm:text-2xl">{book.title}</h1>
          <p className="mt-2 font-mono text-5xl leading-none tabular-nums text-primary sm:text-7xl">{book.score}%</p>
          <progress className="meter mt-3" max={100} value={book.score} aria-label={`${book.title} ${book.score} percent`} />
          <p className={`mt-2 font-mono text-sm tabular-nums ${changeClass}`}>
            {change.label} <span className="text-[10px] tracking-[0.16em] text-muted-foreground">DAY</span>
          </p>
          <p className="mt-3 text-sm leading-5 text-muted-foreground">{book.lens}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 border border-border font-mono">
        <div className="border-r border-border px-2 py-2">
          <dt className="text-[10px] tracking-[0.16em] text-muted-foreground">RAW</dt>
          <dd className="text-lg tabular-nums">{book.raw}</dd>
        </div>
        <div className="border-r border-border px-2 py-2">
          <dt className="text-[10px] tracking-[0.16em] text-muted-foreground">HITS</dt>
          <dd className="text-lg tabular-nums">{book.matchedCount}</dd>
        </div>
        <div className="px-2 py-2">
          <dt className="text-[10px] tracking-[0.16em] text-muted-foreground">READ</dt>
          <dd className="text-lg tabular-nums">{book.headlinesRead}</dd>
        </div>
      </dl>
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">{formatBoardDate(date)} UTC</p>
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">THEMES</h2>
        <ul className="space-y-3">
          {book.themes.map((theme) => {
            const percent = scoreFromRaw(theme.points);
            return (
              <li key={theme.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3 font-mono text-xs">
                  <span className="min-w-0 uppercase">{theme.name}</span>
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
    </div>
  );
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getBook(id)) return <MissingBook />;

  const loaded = await loadBook(id);
  if (loaded.kind === "missing") return <MissingBook />;

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
          <StatusStrip date={null} headlinesRead={null} lastSuccessAt={loaded.lastSuccessAt} />
          <p className="border border-border px-3 py-6 text-center font-mono text-sm tracking-[0.22em]">NO RUN</p>
        </>
      ) : (
        <>
          <StatusStrip
            date={loaded.date}
            headlinesRead={loaded.book.headlinesRead}
            lastSuccessAt={loaded.lastSuccessAt}
          />
          <Panel book={loaded.book} date={loaded.date} matches={loaded.matches} />
        </>
      )}
    </main>
  );
}

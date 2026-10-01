import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MissingBook } from "@/components/missing-book";
import { RunBanner } from "@/components/run-banner";
import { ScoreStrip } from "@/components/score-strip";
import { getBook } from "../../../../data/books";
import { formatLongUtcDate, formatUtcTimestamp } from "@/lib/dates";
import { loadBook } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);
  if (!book) return { title: "Not found" };
  return {
    title: book.title,
    description: book.lens,
  };
}

function scoreClass(score: number): string {
  if (score <= 0) return "text-muted-foreground";
  if (score >= 31) return "text-primary";
  return "text-foreground";
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getBook(id)) return <MissingBook />;

  const loaded = await loadBook(id);
  if (loaded.kind === "missing") return <MissingBook />;

  if (loaded.kind === "empty") {
    return (
      <main>
        <Button variant="link" className="h-auto px-0" render={<Link href="/" />}>
          All books
        </Button>
        <RunBanner banner={loaded.banner} />
        <h1 className="mt-4 font-heading text-4xl tracking-tight sm:text-5xl">{loaded.bookTitle}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          The first run has not landed. There is no stored day to break down yet.
        </p>
      </main>
    );
  }

  const { book, matches, date, banner } = loaded;

  return (
    <main>
      <Button variant="link" className="h-auto px-0" render={<Link href="/" />}>
        All books
      </Button>
      <div className="mt-4">
        <RunBanner banner={banner} />
      </div>
      <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
        {book.author} · {book.year} · {formatLongUtcDate(date)} UTC
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">{book.title}</h1>
        <p
          className={`font-heading text-6xl leading-none tabular-nums ${scoreClass(book.score)}`}
          aria-label={`Score ${book.score} out of 100`}
        >
          {book.score}
        </p>
      </div>
      <p className="mt-4 max-w-xl text-lg leading-8">{book.lens}</p>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
        This meter is how much of today&apos;s headlines are about that pressure. It is not a forecast that
        the plot is happening.
      </p>
      <ScoreStrip history={book.history} label={book.title} />

      <Separator className="my-8" />

      <h2 className="font-heading text-2xl tracking-tight">What went into the number</h2>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-border px-3 py-3">
          <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Raw weight</dt>
          <dd className="mt-1 font-heading text-3xl tabular-nums">{book.raw}</dd>
        </div>
        <div className="border border-border px-3 py-3">
          <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Matched headlines</dt>
          <dd className="mt-1 font-heading text-3xl tabular-nums">{book.matchedCount}</dd>
        </div>
        <div className="border border-border px-3 py-3">
          <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Headlines read</dt>
          <dd className="mt-1 font-heading text-3xl tabular-nums">{book.headlinesRead}</dd>
        </div>
      </dl>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Raw weight is the sum of each headline&apos;s strongest matched phrase for this book, after the same
        title from two outlets is counted once. The score is a curve of that weight, from 0 to 100. It is not
        a share of the day&apos;s headlines.
        {book.headlinesRead === 0 ? " No headline in the file carries this UTC date." : ""}
      </p>

      <h2 className="mt-10 font-heading text-2xl tracking-tight">Themes we score</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {book.themes.map((theme) => (
          <li key={theme.id} className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-base leading-6">{theme.name}</span>
            <span className="font-heading text-2xl tabular-nums">{theme.points}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Points are that theme&apos;s own strongest weights, summed across headlines. A headline still counts
        once toward the book, so theme points can add up to more than the raw weight.
      </p>

      <h2 className="mt-10 font-heading text-2xl tracking-tight">Headlines that fired</h2>
      {matches.length === 0 ? (
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          No headline dated this day matched these phrases.
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {matches.map((match) => (
            <li key={`${match.title}-${match.publishedAt}`} className="py-5">
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                {formatUtcTimestamp(match.publishedAt)} · strongest weight {match.weight}
              </p>
              <h3 className="mt-1 font-heading text-xl leading-snug">
                {match.links[0] ? (
                  <a
                    href={match.links[0].href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    {match.title}
                  </a>
                ) : (
                  match.title
                )}
              </h3>
              {match.description ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{match.description}</p>
              ) : null}
              {match.links.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.links.map((link) => (
                    <Badge
                      key={link.href}
                      variant="outline"
                      render={<a href={link.href} target="_blank" rel="noreferrer" />}
                    >
                      {link.source}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <ul className="mt-3 space-y-1 text-sm leading-6">
                {match.hits.map((hit) => (
                  <li key={`${hit.themeName}-${hit.phrase}`}>
                    Matched “{hit.phrase}” · {hit.themeName} · weight {hit.weight}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

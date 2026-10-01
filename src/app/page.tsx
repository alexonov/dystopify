import { RankedBooks, QuietBooks } from "@/components/book-list";
import { RunBanner } from "@/components/run-banner";
import { formatLongUtcDate } from "@/lib/dates";
import { loadDay } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const day = await loadDay();

  if (day.kind === "empty") {
    return (
      <main>
        <RunBanner banner={day.banner} />
        <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">The first run has not landed.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          The dashboard reads a local file written by the ingest command. Opening this page does not fetch
          news, and it does not call a model.
        </p>
      </main>
    );
  }

  return (
    <main>
      <RunBanner banner={day.banner} />
      <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
        {formatLongUtcDate(day.date)} · UTC
      </p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">Today&apos;s pressures</h1>
      <p className="mt-4 max-w-xl text-base leading-7">
        Each score is how much of this UTC day&apos;s headlines are about that book&apos;s pressure. Scores run
        from 0 to 100 on their own scale. They are not shares of one pie, and they are not a forecast that the
        plot is happening.
      </p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {day.headlinesRead === 0
          ? "No headline in the file is dated this UTC day."
          : `${day.headlinesRead} distinct ${day.headlinesRead === 1 ? "headline" : "headlines"} dated this day.`}
      </p>
      <div className="mt-8">
        <RankedBooks books={day.ranked} />
        <QuietBooks books={day.quiet} />
      </div>
    </main>
  );
}

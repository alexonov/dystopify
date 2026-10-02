import { MeterCard } from "@/components/meter-card";
import { FaultLine, StatusStrip } from "@/components/status-strip";
import { loadDay } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const day = await loadDay();

  if (day.kind === "empty") {
    return (
      <main className="space-y-3">
        <FaultLine banner={day.banner} />
        <StatusStrip date={null} headlinesRead={null} lastSuccessAt={day.lastSuccessAt} />
        <p className="border border-border px-3 py-6 text-center font-mono text-sm tracking-[0.22em]">NO RUN</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <FaultLine banner={day.banner} />
      <StatusStrip date={day.date} headlinesRead={day.headlinesRead} lastSuccessAt={day.lastSuccessAt} />
      <section className="space-y-2">
        <h1 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">RANKED</h1>
        {day.ranked.length === 0 ? (
          <p className="border border-dashed border-border px-3 py-2 font-mono text-xs tracking-[0.18em] text-muted-foreground">
            NONE
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {day.ranked.map((book) => (
              <MeterCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
          QUIET {String(day.quiet.length).padStart(2, "0")}
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {day.quiet.map((book) => (
            <MeterCard key={book.id} book={book} quiet />
          ))}
        </div>
      </section>
    </main>
  );
}

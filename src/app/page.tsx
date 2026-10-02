import { RankRow } from "@/components/rank-row";
import { FaultLine, StatusStrip } from "@/components/status-strip";
import { biggestMove, rankBooks } from "@/lib/board";
import { formatBoardDate } from "@/lib/dates";
import { loadDay } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const day = await loadDay();

  if (day.kind === "empty") {
    return (
      <main className="space-y-3">
        <FaultLine banner={day.banner} />
        <StatusStrip date={null} titlesRead={null} matched={null} move={null} />
        <p className="border border-border px-3 py-6 text-center font-mono text-sm tracking-[0.22em]">NO RUN</p>
      </main>
    );
  }

  const rows = rankBooks(day.rows);
  const matched = rows.filter((book) => book.score > 0).length;

  return (
    <main className="space-y-3">
      <FaultLine banner={day.banner} />
      <StatusStrip
        date={formatBoardDate(day.date)}
        titlesRead={day.headlinesRead}
        matched={matched}
        move={biggestMove(rows)}
      />
      <ol className="list-none">
        {rows.map((book, index) => (
          <RankRow key={book.id} book={book} rank={index + 1} />
        ))}
      </ol>
    </main>
  );
}

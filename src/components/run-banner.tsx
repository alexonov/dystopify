import { formatUtcTimestamp } from "@/lib/dates";
import type { Banner } from "@/lib/view";

export function RunBanner({ banner }: { banner: Banner | null }) {
  if (!banner) return null;
  const lines = banner.error.split("\n").filter(Boolean);

  return (
    <section
      className="mb-8 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6"
      role="alert"
    >
      <p className="font-medium text-foreground">
        The latest ingest failed at {formatUtcTimestamp(banner.failedAt)}. The meters were not cleared.
      </p>
      <p className="mt-1 text-muted-foreground">
        {banner.lastSuccessAt
          ? `Last ingest without an error: ${formatUtcTimestamp(banner.lastSuccessAt)}.`
          : "No ingest has finished without an error yet."}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

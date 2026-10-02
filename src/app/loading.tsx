export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="space-y-3">
      <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">READING</p>
      <div className="grid grid-cols-2 gap-2 border-y border-border py-2 sm:grid-cols-4">
        {["asof", "read", "ingest", "mark"].map((key) => (
          <div key={key} className="h-8 animate-pulse bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {["a", "b", "c", "d"].map((key) => (
          <div key={key} className="grid grid-cols-[4.5rem_1fr] gap-3 border border-border p-2">
            <div className="aspect-[2/3] animate-pulse bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse bg-muted" />
              <div className="h-8 w-20 animate-pulse bg-muted" />
              <div className="h-1.5 w-full animate-pulse bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

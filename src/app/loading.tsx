export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">Reading the stored day</p>
      <div className="mt-3 h-10 w-2/3 animate-pulse bg-muted" />
      <div className="mt-4 h-16 w-full animate-pulse bg-muted" />
      <div className="mt-8 divide-y divide-border border-y border-border">
        {["one", "two", "three", "four"].map((key) => (
          <div key={key} className="grid grid-cols-[auto_1fr_auto] gap-4 py-5">
            <div className="h-4 w-6 animate-pulse bg-muted" />
            <div>
              <div className="h-7 w-40 animate-pulse bg-muted" />
              <div className="mt-2 h-4 w-56 animate-pulse bg-muted" />
            </div>
            <div className="h-10 w-12 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </main>
  );
}

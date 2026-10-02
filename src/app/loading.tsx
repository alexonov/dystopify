export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="space-y-3">
      <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">READING</p>
      <div className="grid grid-cols-2 gap-2 border-y border-border py-2 sm:grid-cols-4">
        {["asof", "titles", "matched", "move"].map((key) => (
          <div key={key} className="h-8 animate-pulse bg-muted" />
        ))}
      </div>
      <ul className="list-none">
        {["a", "b", "c", "d", "e", "f"].map((key) => (
          <li key={key} className="grid grid-cols-[1.75rem_2.75rem_1fr] gap-2 border-b border-border py-2">
            <div className="h-3 animate-pulse bg-muted" />
            <div className="h-3 animate-pulse bg-muted" />
            <div className="space-y-1">
              <div className="h-3 w-40 animate-pulse bg-muted" />
              <div className="h-3 w-56 animate-pulse bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

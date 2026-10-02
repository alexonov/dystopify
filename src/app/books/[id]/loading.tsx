export default function BookLoading() {
  return (
    <main aria-busy="true" aria-live="polite" className="space-y-3">
      <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">READING</p>
      <div className="grid grid-cols-[6.5rem_1fr] gap-3">
        <div className="aspect-[2/3] animate-pulse bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse bg-muted" />
          <div className="h-12 w-24 animate-pulse bg-muted" />
          <div className="h-1.5 w-full animate-pulse bg-muted" />
        </div>
      </div>
    </main>
  );
}

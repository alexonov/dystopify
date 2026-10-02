export default function BookLoading() {
  return (
    <main aria-busy="true" aria-live="polite" className="space-y-3">
      <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">READING</p>
      <div className="space-y-2 border-b border-border pb-3">
        <div className="h-3 w-12 animate-pulse bg-muted" />
        <div className="h-7 w-48 animate-pulse bg-muted" />
        <div className="h-3 w-64 animate-pulse bg-muted" />
        <div className="h-2 w-40 animate-pulse bg-muted" />
      </div>
    </main>
  );
}

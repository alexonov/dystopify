export default function BookLoading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">Reading the stored day</p>
      <div className="mt-4 h-4 w-40 animate-pulse bg-muted" />
      <div className="mt-3 h-12 w-2/3 animate-pulse bg-muted" />
      <div className="mt-4 h-20 w-full animate-pulse bg-muted" />
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["raw", "matched", "read"].map((key) => (
          <div key={key} className="h-20 animate-pulse border border-border bg-muted" />
        ))}
      </div>
    </main>
  );
}

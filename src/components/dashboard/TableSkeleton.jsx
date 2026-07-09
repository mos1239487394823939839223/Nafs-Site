/** Loading skeleton matching the user table's shape. */
export default function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center gap-4 border-b border-border bg-background-subtle/60 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-2.5 flex-1 animate-pulse rounded bg-background-subtle" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-b-0">
          <div className="flex flex-1 items-center gap-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-background-subtle" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 animate-pulse rounded bg-background-subtle" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-background-subtle" />
            </div>
          </div>
          {Array.from({ length: Math.max(0, cols - 2) }).map((_, c) => (
            <div key={c} className="h-3 flex-1 animate-pulse rounded bg-background-subtle" />
          ))}
          <div className="h-8 w-24 animate-pulse rounded-lg bg-background-subtle" />
        </div>
      ))}
    </div>
  );
}

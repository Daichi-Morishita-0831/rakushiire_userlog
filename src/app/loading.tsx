export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* KPI Cards - 6 cards in a 3x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-8 w-32 bg-muted rounded-md" />
            <div className="h-3 w-20 bg-muted rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Skeletons - 3 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-4">
            <div className="h-5 w-36 bg-muted rounded-md" />
            <div className="h-48 w-full bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

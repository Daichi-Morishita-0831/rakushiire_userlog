export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-24 bg-muted rounded-md" />
        <div className="h-4 w-48 bg-muted rounded-md mt-2" />
      </div>

      {/* Liny card skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-muted rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-5 w-28 bg-muted rounded-md" />
              <div className="h-3 w-48 bg-muted rounded-md" />
            </div>
          </div>
          <div className="h-6 w-16 bg-muted rounded-full" />
        </div>
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-3/4 bg-muted rounded-md" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3 flex items-start gap-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-24 bg-muted rounded-md" />
                <div className="h-3 w-full bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-muted rounded-lg" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-4 w-16 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

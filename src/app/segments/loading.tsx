export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-muted rounded-md" />
        <div className="h-10 w-36 bg-muted rounded-md" />
      </div>

      {/* 3 Segment card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 bg-muted rounded-md" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-4 w-full bg-muted rounded-md" />
            <div className="h-4 w-3/4 bg-muted rounded-md" />
            <div className="flex items-center gap-2 pt-2">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-9 w-full bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

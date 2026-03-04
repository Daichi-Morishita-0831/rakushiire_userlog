export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 bg-muted rounded-md" />
        <div className="h-10 w-36 bg-muted rounded-md" />
      </div>

      {/* 3 Rule card skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-md" />
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-muted rounded-md" />
                  <div className="h-3 w-56 bg-muted rounded-md" />
                </div>
              </div>
              <div className="h-6 w-12 bg-muted rounded-full" />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-4 w-24 bg-muted rounded-md" />
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-4 w-20 bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

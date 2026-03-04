export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* 4 Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-8 w-20 bg-muted rounded-md" />
            <div className="h-3 w-16 bg-muted rounded-md" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border">
        {/* Table header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <div className="h-4 w-28 bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded-md" />
          <div className="h-4 w-20 bg-muted rounded-md" />
          <div className="h-4 w-28 bg-muted rounded-md" />
          <div className="h-4 w-20 bg-muted rounded-md" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <div className="h-4 w-28 bg-muted rounded-md" />
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-4 w-20 bg-muted rounded-md" />
            <div className="h-4 w-28 bg-muted rounded-md" />
            <div className="h-4 w-20 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

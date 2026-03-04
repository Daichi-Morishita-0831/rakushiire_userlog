export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Filters bar skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-44 bg-muted rounded-md" />
        <div className="h-10 w-36 bg-muted rounded-md" />
        <div className="h-10 w-36 bg-muted rounded-md" />
        <div className="ml-auto h-10 w-28 bg-muted rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border">
        {/* Table header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <div className="h-4 w-28 bg-muted rounded-md" />
          <div className="h-4 w-32 bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded-md" />
          <div className="h-4 w-28 bg-muted rounded-md" />
          <div className="h-4 w-20 bg-muted rounded-md" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <div className="h-4 w-28 bg-muted rounded-md" />
            <div className="h-4 w-32 bg-muted rounded-md" />
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-4 w-28 bg-muted rounded-md" />
            <div className="h-4 w-20 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

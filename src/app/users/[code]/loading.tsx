export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton - back button + user name */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-muted rounded-md" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-center gap-2 border-b pb-2">
        <div className="h-8 w-20 bg-muted rounded-md" />
        <div className="h-8 w-20 bg-muted rounded-md" />
        <div className="h-8 w-20 bg-muted rounded-md" />
        <div className="h-8 w-20 bg-muted rounded-md" />
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="h-5 w-28 bg-muted rounded-md" />
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-3/4 bg-muted rounded-md" />
          <div className="h-4 w-1/2 bg-muted rounded-md" />
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="h-5 w-28 bg-muted rounded-md" />
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-3/4 bg-muted rounded-md" />
          <div className="h-4 w-1/2 bg-muted rounded-md" />
        </div>
      </div>

      {/* Additional content block */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="h-5 w-36 bg-muted rounded-md" />
        <div className="h-32 w-full bg-muted rounded-md" />
      </div>
    </div>
  );
}

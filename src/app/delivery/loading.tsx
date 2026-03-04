export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Step indicator skeleton */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted rounded-md" />
            {i < 3 && <div className="h-0.5 w-12 bg-muted rounded-md" />}
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-6 w-48 bg-muted rounded-md" />
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-4 w-3/4 bg-muted rounded-md" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-10 w-full bg-muted rounded-md" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-10 w-full bg-muted rounded-md" />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <div className="h-4 w-32 bg-muted rounded-md" />
          <div className="h-24 w-full bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}

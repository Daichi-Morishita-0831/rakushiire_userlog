"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <AlertTriangle className="h-12 w-12 text-orange-500" />
      <h2 className="text-lg font-semibold">エラーが発生しました</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message || "予期しないエラーが発生しました。再度お試しください。"}
      </p>
      <Button onClick={reset} variant="outline">
        再試行
      </Button>
    </div>
  );
}

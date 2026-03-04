"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h2 className="text-2xl font-bold">エラーが発生しました</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        予期しないエラーが発生しました。再試行するか、問題が続く場合は管理者にお問い合わせください。
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-2 max-w-lg overflow-auto rounded-md bg-muted p-4 text-xs">
          {error.message}
        </pre>
      )}
      <Button onClick={reset}>再試行</Button>
    </div>
  );
}

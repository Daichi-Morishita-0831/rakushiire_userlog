"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold">システムエラー</h2>
        <p className="text-muted-foreground text-sm">
          アプリケーションで重大なエラーが発生しました
        </p>
        <Button onClick={reset}>再読み込み</Button>
      </body>
    </html>
  );
}

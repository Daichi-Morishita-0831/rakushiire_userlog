import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-2xl font-bold">ページが見つかりません</h1>
      <p className="text-muted-foreground text-sm">
        お探しのページは存在しないか、移動した可能性があります
      </p>
      <Button asChild>
        <Link href="/">ダッシュボードに戻る</Link>
      </Button>
    </div>
  );
}

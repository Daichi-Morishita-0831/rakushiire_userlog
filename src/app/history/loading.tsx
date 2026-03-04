import { TableSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return <TableSkeleton rows={10} cols={6} />;
}

import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading() {
  return (
    <div className="flex flex-col gap-6 py-8" role="status" aria-label="Loading page">
      <Skeleton className="h-9 w-56 rounded-xl" />
      <Skeleton className="h-5 w-72 max-w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)}
      </div>
    </div>
  );
}

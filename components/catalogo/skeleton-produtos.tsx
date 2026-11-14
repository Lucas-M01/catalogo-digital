import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonProdutos() {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {["primeiro", "segundo", "terceiro"].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-lg border bg-card p-2"
        >
          <Skeleton className="aspect-square rounded-lg" />
          <div className="mt-2 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

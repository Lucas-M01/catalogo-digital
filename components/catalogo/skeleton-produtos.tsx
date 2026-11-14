import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonProdutos() {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-3">
      {["primeiro", "segundo", "terceiro"].map((item) => (
        <div key={item} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-2 md:p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

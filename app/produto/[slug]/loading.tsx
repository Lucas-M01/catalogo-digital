import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProduto() {
  return (
    <div>
      <output className="sr-only">Carregando produto</output>
      <div aria-hidden="true" className="space-y-6">
        <div className="flex h-12 items-center">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

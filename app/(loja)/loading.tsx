import { SkeletonProdutos } from "@/components/catalogo/skeleton-produtos";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCatalogo() {
  return (
    <>
      <output className="sr-only">Carregando cardápio</output>
      <div aria-hidden="true" className="space-y-8">
        <div className="flex h-12 items-center justify-between gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-12 w-36" />
        </div>
        <div className="flex gap-2 overflow-hidden p-1">
          <Skeleton className="h-12 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-12 w-24 shrink-0 rounded-full" />
          <Skeleton className="h-12 w-24 shrink-0 rounded-full" />
        </div>
        <SkeletonProdutos />
      </div>
    </>
  );
}

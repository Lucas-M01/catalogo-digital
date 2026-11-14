import { SkeletonProdutos } from "@/components/catalogo/skeleton-produtos";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingBusca() {
  return (
    <>
      <output className="sr-only">Carregando busca</output>
      <div aria-hidden="true" className="space-y-6">
        <Skeleton className="h-9 w-52" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-12 w-full md:col-span-2 md:w-48" />
        </div>
        <SkeletonProdutos />
      </div>
    </>
  );
}

import Link from "next/link";
import { Categorias } from "@/components/catalogo/categorias";
import { ListaProdutos } from "@/components/catalogo/lista-produtos";
import {
  getCategorias,
  getProdutos,
  getProdutosPorCategoria,
} from "@/lib/produtos";

export const revalidate = 300;

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [{ categoria }, categorias] = await Promise.all([
    searchParams,
    getCategorias(),
  ]);
  const slug = Array.isArray(categoria) ? categoria[0] : categoria;
  const categoriaAtiva = categorias.find((item) => item.slug === slug)?.slug;
  const produtos = await (categoriaAtiva
    ? getProdutosPorCategoria(categoriaAtiva)
    : getProdutos());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold uppercase tracking-tight">Cardápio</h1>
        <Link
          href="/busca"
          className="inline-flex min-h-12 items-center rounded-lg border px-4 text-sm font-medium motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          Buscar produtos
        </Link>
      </div>
      <Categorias categorias={categorias} categoriaAtiva={categoriaAtiva} />
      {produtos.length > 0 ? (
        <ListaProdutos produtos={produtos} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum produto disponível nesta seleção.
        </p>
      )}
    </div>
  );
}

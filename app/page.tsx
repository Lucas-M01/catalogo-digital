import Link from "next/link";
import { Categorias } from "@/components/catalogo/categorias";
import { ListaProdutos } from "@/components/catalogo/lista-produtos";
import { getCategorias, getProdutos } from "@/lib/produtos";

export default async function HomePage() {
  const [produtos, categorias] = await Promise.all([
    getProdutos(),
    getCategorias(),
  ]);
  const produtosPorCategoria = Map.groupBy(
    produtos,
    (produto) => produto.categoria.slug,
  );
  const categoriasComProdutos = categorias.filter(({ slug }) =>
    produtosPorCategoria.has(slug),
  );

  const imagensPrioritarias = categoriasComProdutos
    .flatMap(({ slug }) => produtosPorCategoria.get(slug) ?? [])
    .slice(0, 4)
    .map(({ id }) => id);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Cardápio</h1>
          <Link
            href="/busca"
            className="inline-flex min-h-12 items-center rounded-lg border px-4 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            Buscar produtos
          </Link>
        </div>
        <Categorias categorias={categoriasComProdutos} />
      </div>
      {categoriasComProdutos.map(({ slug, nome }) => (
        <section
          key={slug}
          id={`categoria-${slug}`}
          aria-labelledby={`titulo-${slug}`}
          className="scroll-mt-4 space-y-4"
        >
          <h2 id={`titulo-${slug}`} className="text-xl font-semibold">
            {nome}
          </h2>
          <ListaProdutos
            produtos={produtosPorCategoria.get(slug) ?? []}
            imagensPrioritarias={imagensPrioritarias}
          />
        </section>
      ))}
    </div>
  );
}

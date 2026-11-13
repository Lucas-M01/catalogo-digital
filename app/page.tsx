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

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Cardápio</h1>
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
          <ListaProdutos produtos={produtosPorCategoria.get(slug) ?? []} />
        </section>
      ))}
    </div>
  );
}

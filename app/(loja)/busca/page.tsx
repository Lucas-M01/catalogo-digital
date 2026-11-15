import type { Metadata } from "next";
import { Filtros } from "@/components/catalogo/filtros";
import { ListaProdutos } from "@/components/catalogo/lista-produtos";
import { buscarProdutos, getCategorias } from "@/lib/produtos";

export const metadata: Metadata = { title: "Buscar produtos" };

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    categoria?: string | string[];
    promocao?: string | string[];
  }>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const categoria =
    (Array.isArray(params.categoria)
      ? params.categoria[0]
      : params.categoria) ?? "";
  const apenasPromocao =
    (Array.isArray(params.promocao) ? params.promocao[0] : params.promocao) ===
    "1";
  const [produtos, categorias] = await Promise.all([
    buscarProdutos(q, categoria, apenasPromocao),
    getCategorias(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Buscar produtos</h1>
      <Filtros
        q={q}
        categoria={categoria}
        categorias={categorias}
        apenasPromocao={apenasPromocao}
        semResultados={produtos.length === 0}
      />
      {produtos.length > 0 && <ListaProdutos produtos={produtos} />}
    </div>
  );
}

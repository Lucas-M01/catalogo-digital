import { cache } from "react";
import { supabasePublico } from "@/lib/supabase/publico";
import type { Categoria, Produto } from "@/types";

const CAMPOS_CATEGORIA = "id, nome, slug, ordem";
const CAMPOS_PRODUTO = `
  id, nome, slug, descricao, preco, imagem_url, disponivel, destaque, ordem,
  categoria:categorias!inner(${CAMPOS_CATEGORIA}),
  promocoes(preco_promocional, inicio, fim)
` as const;
const TAMANHO_PAGINA = 1000;

type LinhaProduto = Omit<Produto, "preco" | "preco_promocional"> & {
  preco: number | string;
  promocoes: {
    preco_promocional: number | string;
    inicio: string;
    fim: string | null;
  }[];
};

function paraProduto({ promocoes, ...produto }: LinhaProduto): Produto {
  const agora = Date.now();
  const preco = Number(produto.preco);
  const menor = Math.min(
    preco,
    ...promocoes
      .filter(
        ({ inicio, fim }) =>
          Date.parse(inicio) <= agora &&
          (fim === null || Date.parse(fim) > agora),
      )
      .map(({ preco_promocional }) => Number(preco_promocional)),
  );

  return {
    ...produto,
    preco,
    preco_promocional: menor < preco ? menor : null,
  };
}

function consultarProdutosDisponiveis() {
  return supabasePublico
    .from("produtos")
    .select(CAMPOS_PRODUTO)
    .eq("disponivel", true);
}

async function listarProdutos(categoriaSlug?: string): Promise<Produto[]> {
  const produtos: Produto[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const consulta = consultarProdutosDisponiveis();
    if (categoriaSlug !== undefined)
      consulta.eq("categoria.slug", categoriaSlug);

    const { data, error } = await consulta
      .order("id")
      .range(inicio, inicio + TAMANHO_PAGINA - 1)
      .overrideTypes<LinhaProduto[], { merge: false }>();

    if (error) throw new Error("Falha ao carregar produtos");
    produtos.push(...data.map(paraProduto));
    if (data.length < TAMANHO_PAGINA) break;
  }

  return produtos.sort(
    (a, b) =>
      a.categoria.ordem - b.categoria.ordem ||
      a.categoria.slug.localeCompare(b.categoria.slug) ||
      a.ordem - b.ordem,
  );
}

export async function getProdutos(): Promise<Produto[]> {
  return listarProdutos();
}

export const getProdutoBySlug = cache(
  async (slug: string): Promise<Produto | null> => {
    const { data, error } = await consultarProdutosDisponiveis()
      .eq("slug", slug)
      .maybeSingle()
      .overrideTypes<LinhaProduto, { merge: false }>();

    if (error) throw new Error("Falha ao carregar produto");
    return data ? paraProduto(data) : null;
  },
);

export async function getProdutosPorCategoria(
  categoriaSlug: string,
): Promise<Produto[]> {
  return listarProdutos(categoriaSlug);
}

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabasePublico
    .from("categorias")
    .select(CAMPOS_CATEGORIA)
    .order("ordem")
    .order("slug")
    .overrideTypes<Categoria[], { merge: false }>();

  if (error) throw new Error("Falha ao carregar categorias");
  return data;
}

function normalizarBusca(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export async function buscarProdutos(
  query: string,
  categoriaSlug?: string,
  apenasPromocao = false,
): Promise<Produto[]> {
  const q = normalizarBusca(query.trim());
  const produtos = await (categoriaSlug
    ? getProdutosPorCategoria(categoriaSlug)
    : getProdutos());

  return produtos.filter(
    (p) =>
      (!apenasPromocao || p.preco_promocional !== null) &&
      (normalizarBusca(p.nome).includes(q) ||
        normalizarBusca(p.descricao ?? "").includes(q)),
  );
}

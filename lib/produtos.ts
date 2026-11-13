// Para migrar para Supabase: substituir as importações abaixo
// pelos clientes do Supabase. Nenhum componente muda.

import { categoriasMock, produtosMock } from "@/lib/mock/produtos";
import type { Categoria, Produto } from "@/types";

export async function getProdutos(): Promise<Produto[]> {
  return produtosMock.filter((p) => p.disponivel);
}

export async function getProdutoBySlug(slug: string): Promise<Produto | null> {
  return produtosMock.find((p) => p.slug === slug && p.disponivel) ?? null;
}

export async function getProdutosPorCategoria(
  categoriaSlug: string,
): Promise<Produto[]> {
  return produtosMock.filter(
    (p) => p.disponivel && p.categoria.slug === categoriaSlug,
  );
}

export async function getCategorias(): Promise<Categoria[]> {
  return [...categoriasMock].sort((a, b) => a.ordem - b.ordem);
}

export async function buscarProdutos(
  query: string,
  categoriaSlug?: string,
): Promise<Produto[]> {
  const q = query.toLowerCase();
  return produtosMock.filter((p) => {
    const matchNome = p.nome.toLowerCase().includes(q);
    const matchDesc = p.descricao?.toLowerCase().includes(q) ?? false;
    const matchCategoria = categoriaSlug
      ? p.categoria.slug === categoriaSlug
      : true;
    return p.disponivel && (matchNome || matchDesc) && matchCategoria;
  });
}

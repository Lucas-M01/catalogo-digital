import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DadosProduto } from "@/lib/admin/schemas";
import { gerarSlugDisponivel } from "@/lib/admin/slug";
import type { ProdutoAdmin, Promocao } from "@/types";

const camposProduto = `
  id, nome, slug, descricao, preco, imagem_url, imagem_path, disponivel, destaque, ordem,
  categoria:categorias!inner(id, nome, slug, ordem),
  promocoes(id, produto_id, preco_promocional, inicio, fim)
` as const;
const tamanhoPagina = 1000;
type ResultadoEscrita = { ok: true } | { ok: false; mensagem: string };
type LinhaProduto = Omit<ProdutoAdmin, "preco" | "promocoes"> & {
  preco: number | string;
  promocoes: (Omit<Promocao, "preco_promocional"> & {
    preco_promocional: number | string;
  })[];
};

function paraProdutoAdmin({
  preco,
  promocoes,
  ...produto
}: LinhaProduto): ProdutoAdmin {
  return {
    ...produto,
    preco: Number(preco),
    promocoes: promocoes.map((promocao) => ({
      ...promocao,
      preco_promocional: Number(promocao.preco_promocional),
    })),
  };
}

function normalizarNome(nome: string) {
  return nome.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export async function listarProdutos(supabase: SupabaseClient, busca = "") {
  const produtos: ProdutoAdmin[] = [];
  const termo = normalizarNome(busca);

  for (let inicio = 0; ; inicio += tamanhoPagina) {
    const { data, error } = await supabase
      .from("produtos")
      .select(camposProduto)
      .order("ordem")
      .order("slug")
      .range(inicio, inicio + tamanhoPagina - 1)
      .overrideTypes<LinhaProduto[], { merge: false }>();

    if (error) return null;

    produtos.push(
      ...data
        .filter(({ nome }) => normalizarNome(nome).includes(termo))
        .map(paraProdutoAdmin),
    );
    if (data.length < tamanhoPagina) return produtos;
  }
}

export async function buscarProdutoPorId(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("produtos")
    .select(camposProduto)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<LinhaProduto, { merge: false }>();

  return {
    produto: data ? paraProdutoAdmin(data) : null,
    falhou: Boolean(error),
  };
}

export async function inserirProduto(
  supabase: SupabaseClient,
  dados: DadosProduto,
): Promise<ResultadoEscrita> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const slug = await gerarSlugDisponivel(supabase, "produtos", dados.nome);
    if (slug === null) break;

    const { error } = await supabase
      .from("produtos")
      .insert({ ...dados, slug });
    if (!error) return { ok: true };
    if (error.code === "23503")
      return {
        ok: false,
        mensagem:
          "A categoria selecionada não existe mais. Escolha outra categoria.",
      };
    if (error.code !== "23505") break;
  }

  return {
    ok: false,
    mensagem: "Não foi possível criar o produto. Tente novamente.",
  };
}

export async function atualizarProduto(
  supabase: SupabaseClient,
  id: string,
  dados: DadosProduto | Pick<DadosProduto, "disponivel">,
): Promise<ResultadoEscrita> {
  const { data, error } = await supabase
    .from("produtos")
    .update(dados)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503")
    return {
      ok: false,
      mensagem:
        "A categoria selecionada não existe mais. Escolha outra categoria.",
    };
  if (error)
    return {
      ok: false,
      mensagem: "Não foi possível salvar o produto. Tente novamente.",
    };
  if (!data) return { ok: false, mensagem: "Produto não encontrado." };
  return { ok: true };
}

export function alternarDisponivel(
  supabase: SupabaseClient,
  id: string,
  disponivel: boolean,
) {
  return atualizarProduto(supabase, id, { disponivel });
}

export async function excluirProduto(
  supabase: SupabaseClient,
  id: string,
): Promise<ResultadoEscrita & { imagemPendente?: boolean }> {
  const { data, error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", id)
    .select("imagem_path")
    .maybeSingle()
    .overrideTypes<Pick<ProdutoAdmin, "imagem_path">, { merge: false }>();

  if (error)
    return {
      ok: false,
      mensagem: "Não foi possível excluir o produto. Tente novamente.",
    };
  if (!data) return { ok: false, mensagem: "Produto não encontrado." };
  if (data.imagem_path === null) return { ok: true };

  const imagemRemovida = await supabase.storage
    .from("produtos")
    .remove([data.imagem_path])
    .then(
      ({ error }) => !error,
      () => false,
    );

  if (!imagemRemovida) {
    console.error("Falha ao remover imagem de produto excluído", {
      id,
      caminho: data.imagem_path,
    });
    return { ok: true, imagemPendente: true };
  }
  return { ok: true };
}

export async function contarProdutos(supabase: SupabaseClient) {
  const [total, ocultos] = await Promise.all([
    supabase.from("produtos").select("id", { count: "exact", head: true }),
    supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("disponivel", false),
  ]);

  return {
    total: total.count,
    ocultos: ocultos.count,
  };
}

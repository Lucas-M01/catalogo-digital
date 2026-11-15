import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DadosProduto } from "@/lib/admin/schemas";
import { gerarSlugDisponivel } from "@/lib/admin/slug";
import type { ImagemProduto, ProdutoAdmin, Promocao } from "@/types";

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
  dados: DadosProduto & ImagemProduto,
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
  alteracaoImagem?: { atual: ImagemProduto; nova: ImagemProduto },
): Promise<ResultadoEscrita> {
  const consulta = supabase
    .from("produtos")
    .update({ ...dados, ...alteracaoImagem?.nova })
    .eq("id", id);

  if (alteracaoImagem) {
    const { imagem_url, imagem_path } = alteracaoImagem.atual;
    if (imagem_url === null) consulta.is("imagem_url", null);
    else consulta.eq("imagem_url", imagem_url);
    if (imagem_path === null) consulta.is("imagem_path", null);
    else consulta.eq("imagem_path", imagem_path);
  }
  const { data, error } = await consulta.select("id").maybeSingle();

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
  if (!data) {
    return {
      ok: false,
      mensagem: alteracaoImagem
        ? "O produto ou a imagem mudou durante a edição. Recarregue a página antes de salvar."
        : "Produto não encontrado.",
    };
  }
  if (
    alteracaoImagem &&
    alteracaoImagem.atual.imagem_path !== alteracaoImagem.nova.imagem_path
  ) {
    await removerImagemProduto(supabase, id, alteracaoImagem.atual.imagem_path);
  }
  return { ok: true };
}

export async function buscarImagemProduto(
  supabase: SupabaseClient,
  id: string,
) {
  return supabase
    .from("produtos")
    .select("imagem_url,imagem_path")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<ImagemProduto, { merge: false }>();
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
  const removida = await removerImagemProduto(supabase, id, data.imagem_path);
  return removida ? { ok: true } : { ok: true, imagemPendente: true };
}

async function removerImagemProduto(
  supabase: SupabaseClient,
  id: string,
  caminho: string | null,
) {
  if (caminho === null) return true;

  const imagemRemovida = await supabase.storage
    .from("produtos")
    .remove([caminho])
    .then(
      ({ error }) => !error,
      () => false,
    );

  if (!imagemRemovida) {
    console.error("Falha ao remover imagem anterior do produto", {
      id,
      caminho,
    });
  }
  return imagemRemovida;
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

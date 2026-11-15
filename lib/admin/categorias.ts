import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { gerarSlugDisponivel } from "@/lib/admin/slug";
import type { Categoria } from "@/types";

type LinhaCategoria = Categoria & { produtos: { count: number }[] };
type CategoriaComContagem = Categoria & { totalProdutos: number };
type ResultadoEscrita = { ok: true } | { ok: false; mensagem: string };
type AlteracaoCategoria = Pick<Categoria, "nome"> | Pick<Categoria, "ordem">;

const tamanhoPagina = 1000;

export async function listarCategorias(
  supabase: SupabaseClient,
): Promise<CategoriaComContagem[] | null> {
  const categorias: CategoriaComContagem[] = [];

  for (let inicio = 0; ; inicio += tamanhoPagina) {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nome, slug, ordem, produtos(count)")
      .order("ordem")
      .order("slug")
      .range(inicio, inicio + tamanhoPagina - 1)
      .overrideTypes<LinhaCategoria[], { merge: false }>();

    if (error) return null;

    for (const { produtos, ...categoria } of data) {
      categorias.push({ ...categoria, totalProdutos: produtos[0]?.count ?? 0 });
    }
    if (data.length < tamanhoPagina) return categorias;
  }
}

export async function inserirCategoria(
  supabase: SupabaseClient,
  dados: Pick<Categoria, "nome" | "ordem">,
): Promise<ResultadoEscrita> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const slug = await gerarSlugDisponivel(supabase, "categorias", dados.nome);
    if (slug === null) break;

    const { error } = await supabase
      .from("categorias")
      .insert({ ...dados, slug });
    if (!error) return { ok: true };
    if (error.code !== "23505") break;
  }

  return {
    ok: false,
    mensagem: "Não foi possível criar a categoria. Tente novamente.",
  };
}

export async function atualizarCategoria(
  supabase: SupabaseClient,
  id: string,
  alteracao: AlteracaoCategoria,
): Promise<ResultadoEscrita> {
  const { data, error } = await supabase
    .from("categorias")
    .update(alteracao)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      mensagem: "Não foi possível salvar a categoria. Tente novamente.",
    };
  }
  if (!data) return { ok: false, mensagem: "Categoria não encontrada." };
  return { ok: true };
}

export async function excluirCategoria(
  supabase: SupabaseClient,
  id: string,
): Promise<ResultadoEscrita> {
  const { data, error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return {
      ok: false,
      mensagem:
        "Esta categoria tem produtos vinculados. Mova os produtos para outra categoria antes de excluí-la.",
    };
  }
  if (error) {
    return {
      ok: false,
      mensagem: "Não foi possível excluir a categoria. Tente novamente.",
    };
  }
  if (!data) return { ok: false, mensagem: "Categoria não encontrada." };
  return { ok: true };
}

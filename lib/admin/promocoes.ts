import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Produto, Promocao, StatusPromocao } from "@/types";

export type DadosPromocao = Omit<Promocao, "id">;
type ProdutoPromocao = Pick<Produto, "id" | "nome" | "preco">;
export type PromocaoAdmin = Promocao & { produto: ProdutoPromocao };
type LinhaPromocao = Omit<PromocaoAdmin, "preco_promocional" | "produto"> & {
  preco_promocional: number | string;
  produto: Omit<ProdutoPromocao, "preco"> & { preco: number | string };
};

const campos =
  "id,produto_id,preco_promocional,inicio,fim,produto:produtos!inner(id,nome,preco)";
const tamanhoPagina = 1000;
export const mensagemSobreposicao =
  "Já existe uma promoção desse produto que coincide com esse período.";

export function calcularStatus(
  promocao: Pick<Promocao, "inicio" | "fim">,
  agora = new Date(),
): StatusPromocao {
  if (Date.parse(promocao.inicio) > agora.getTime()) return "agendada";
  if (promocao.fim !== null && Date.parse(promocao.fim) <= agora.getTime())
    return "expirada";
  return "ativa";
}

function paraPromocaoAdmin({
  preco_promocional,
  produto,
  ...promocao
}: LinhaPromocao): PromocaoAdmin {
  return {
    ...promocao,
    preco_promocional: Number(preco_promocional),
    produto: { ...produto, preco: Number(produto.preco) },
  };
}

export async function listarPromocoes(supabase: SupabaseClient) {
  const agora = new Date();
  const grupos: Record<StatusPromocao, PromocaoAdmin[]> = {
    ativa: [],
    agendada: [],
    expirada: [],
  };
  for (let inicio = 0; ; inicio += tamanhoPagina) {
    const { data, error } = await supabase
      .from("promocoes")
      .select(campos)
      .order("inicio", { ascending: false })
      .order("id")
      .range(inicio, inicio + tamanhoPagina - 1)
      .overrideTypes<LinhaPromocao[], { merge: false }>();

    if (error) return null;
    for (const registro of data) {
      grupos[calcularStatus(registro, agora)].push(paraPromocaoAdmin(registro));
    }
    if (data.length < tamanhoPagina) {
      grupos.agendada.reverse();
      return grupos;
    }
  }
}

export async function buscarPromocaoPorId(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("promocoes")
    .select(campos)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<LinhaPromocao, { merge: false }>();

  return {
    promocao: data ? paraPromocaoAdmin(data) : null,
    falhou: Boolean(error),
  };
}

export async function existeSobreposicao(
  supabase: SupabaseClient,
  { produto_id, inicio, fim }: DadosPromocao,
  id?: string,
) {
  const consulta = supabase
    .from("promocoes")
    .select("id")
    .eq("produto_id", produto_id)
    .or(`fim.is.null,fim.gt.${inicio}`);
  if (fim !== null) consulta.lt("inicio", fim);
  if (id) consulta.neq("id", id);

  const { data, error } = await consulta.limit(1).maybeSingle();
  return error ? null : data !== null;
}

export function inserirPromocao(
  supabase: SupabaseClient,
  dados: DadosPromocao,
) {
  return supabase.from("promocoes").insert(dados);
}

export function atualizarPromocao(
  supabase: SupabaseClient,
  id: string,
  dados: DadosPromocao,
) {
  return supabase
    .from("promocoes")
    .update(dados)
    .eq("id", id)
    .select("id")
    .maybeSingle();
}

export function encerrarAgora(supabase: SupabaseClient, id: string) {
  const agora = new Date().toISOString();
  return supabase
    .from("promocoes")
    .update({ fim: agora })
    .eq("id", id)
    .lt("inicio", agora)
    .or(`fim.is.null,fim.gt.${agora}`)
    .select("id")
    .maybeSingle();
}

export function excluirPromocao(supabase: SupabaseClient, id: string) {
  return supabase
    .from("promocoes")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
}

export async function contarPromocoesAtivas(supabase: SupabaseClient) {
  const agora = new Date().toISOString();
  const { count } = await supabase
    .from("promocoes")
    .select("id", { count: "exact", head: true })
    .lte("inicio", agora)
    .or(`fim.is.null,fim.gt.${agora}`);

  return count;
}

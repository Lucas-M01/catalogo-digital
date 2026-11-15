import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConfigLoja, HorarioFuncionamento } from "@/types";

export async function lerDadosLojaAdmin(supabase: SupabaseClient) {
  const [horarios, config] = await Promise.all([
    supabase
      .from("horarios_funcionamento")
      .select("dia_semana, abre, fecha")
      .order("dia_semana")
      .order("abre")
      .overrideTypes<HorarioFuncionamento[], { merge: false }>(),
    supabase
      .from("configuracoes_loja")
      .select("usar_horarios, fechada_manualmente, reabre_em, mensagem_fechada")
      .eq("id", 1)
      .single()
      .overrideTypes<ConfigLoja, { merge: false }>(),
  ]);

  return {
    horarios:
      horarios.data?.map(({ dia_semana, abre, fecha }) => ({
        dia_semana,
        abre: abre.slice(0, 5),
        fecha: fecha.slice(0, 5),
      })) ?? null,
    config: config.data,
  };
}

export function salvarSemana(
  supabase: SupabaseClient,
  horarios: HorarioFuncionamento[],
) {
  return supabase.rpc("salvar_horarios", { p_horarios: horarios });
}

export function atualizarConfig(
  supabase: SupabaseClient,
  dados:
    | Pick<ConfigLoja, "usar_horarios">
    | Pick<
        ConfigLoja,
        "fechada_manualmente" | "reabre_em" | "mensagem_fechada"
      >,
) {
  return supabase
    .from("configuracoes_loja")
    .update(dados)
    .eq("id", 1)
    .select("id")
    .single();
}

import "server-only";
import { z } from "zod";
import { supabasePublico } from "@/lib/supabase/publico";
import type { ConfigLoja, HorarioFuncionamento } from "@/types";

const CONFIG_PADRAO: Readonly<ConfigLoja> = {
  usar_horarios: false,
  fechada_manualmente: false,
  reabre_em: null,
  mensagem_fechada: null,
};

const horaBanco = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/)
  .transform((hora) => hora.slice(0, 5));

const horariosBanco = z.array(
  z
    .object({
      dia_semana: z.number().int().min(0).max(6),
      abre: horaBanco,
      fecha: horaBanco,
    })
    .refine(({ abre, fecha }) => abre !== fecha),
);

export async function getHorarios(): Promise<HorarioFuncionamento[] | null> {
  try {
    const { data, error } = await supabasePublico
      .from("horarios_funcionamento")
      .select("dia_semana, abre, fecha")
      .order("dia_semana")
      .order("abre");
    if (error) throw error;

    const horarios = horariosBanco.parse(data);
    const intervalosPorDia = [0, 0, 0, 0, 0, 0, 0];
    for (const { dia_semana } of horarios) {
      intervalosPorDia[dia_semana] += 1;
      if (intervalosPorDia[dia_semana] > 2) {
        throw new Error("Mais de dois intervalos no mesmo dia");
      }
    }
    return horarios;
  } catch (erro) {
    console.error("Falha ao carregar horários de funcionamento", erro);
    return null;
  }
}

export async function getConfigLoja(): Promise<ConfigLoja> {
  try {
    const { data, error } = await supabasePublico
      .from("configuracoes_loja")
      .select("usar_horarios, fechada_manualmente, reabre_em, mensagem_fechada")
      .eq("id", 1)
      .single()
      .overrideTypes<ConfigLoja, { merge: false }>();
    if (error) throw error;
    return data;
  } catch (erro) {
    console.error("Falha ao carregar a configuração da loja", erro);
    return { ...CONFIG_PADRAO };
  }
}

export async function getDadosLoja() {
  const [horarios, config] = await Promise.all([
    getHorarios(),
    getConfigLoja(),
  ]);
  return {
    horarios: horarios ?? [],
    config: horarios === null ? { ...CONFIG_PADRAO } : config,
  };
}

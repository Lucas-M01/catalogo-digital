"use server";

import { z } from "zod";
import { exigirAdmin } from "@/lib/admin/auth";
import { converterDataBrasilia } from "@/lib/admin/datas";
import { atualizarConfig, salvarSemana } from "@/lib/admin/horarios";
import { revalidarCatalogo } from "@/lib/admin/revalidar";
import type { EstadoForm } from "@/types";

const hora = z
  .string("Informe um horário no formato HH:mm.")
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Informe um horário no formato HH:mm.");
const intervalo = z
  .object({ abre: hora, fecha: hora }, "Informe a abertura e o fechamento.")
  .refine(({ abre, fecha }) => abre !== fecha, {
    path: ["fecha"],
    message: "O fechamento deve ser diferente da abertura.",
  });

const dia = z
  .array(intervalo, "Informe os intervalos do dia.")
  .max(2, "Informe no máximo dois intervalos por dia.")
  .superRefine(([primeiro, segundo], ctx) => {
    if (!primeiro || !segundo) return;
    const fimDoDia = ({ abre, fecha }: z.infer<typeof intervalo>) =>
      fecha < abre ? "24:00" : fecha;
    if (
      primeiro.abre < fimDoDia(segundo) &&
      segundo.abre < fimDoDia(primeiro)
    ) {
      ctx.addIssue({
        code: "custom",
        path: [1, "abre"],
        message: "Os dois intervalos deste dia se sobrepõem.",
      });
    }
  });

const semana = z
  .array(dia, "Informe os horários dos sete dias.")
  .length(7, "Informe os horários dos sete dias.");

const interruptor = z
  .enum(["true", "false"], "Informe se a opção está ligada.")
  .transform((valor) => valor === "true");
const configuracao = z.discriminatedUnion("secao", [
  z.object({ secao: z.literal("grade"), usar_horarios: interruptor }),
  z.object({
    secao: z.literal("pausa"),
    fechada_manualmente: interruptor,
    reabre_em: z
      .string("Informe uma data e hora válidas.")
      .transform((valor, ctx) => {
        if (valor === "") return null;
        const iso = converterDataBrasilia(valor);
        if (iso && Date.parse(iso) > Date.now()) return iso;
        ctx.addIssue({
          code: "custom",
          message: iso
            ? "Informe uma data e hora futuras."
            : "Informe uma data e hora válidas.",
        });
        return z.NEVER;
      }),
    mensagem_fechada: z
      .string("Informe uma mensagem de até 200 caracteres.")
      .trim()
      .max(200, "Use até 200 caracteres.")
      .transform((mensagem) => mensagem || null),
  }),
]);

export async function salvarHorarios(
  _estado: EstadoForm,
  dados: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const valor: unknown = dados.get("semana");
  let entrada: unknown;
  try {
    entrada = typeof valor === "string" ? JSON.parse(valor) : null;
  } catch {
    return {
      ok: false,
      mensagem: "Não foi possível ler os horários enviados.",
    };
  }
  const resultado = semana.safeParse(entrada);
  if (!resultado.success) {
    const erros: NonNullable<EstadoForm["erros"]> = {};
    for (const { path, message } of resultado.error.issues) {
      const campo = path.join(".") || "semana";
      erros[campo] ??= [];
      erros[campo].push(message);
    }
    return { ok: false, erros, mensagem: erros.semana?.[0] };
  }

  const horarios = resultado.data.flatMap((intervalos, dia_semana) =>
    intervalos.map((item) => ({ dia_semana, ...item })),
  );
  const { error } = await salvarSemana(supabase, horarios);
  if (error)
    return { ok: false, mensagem: "Não foi possível salvar os horários." };

  revalidarCatalogo();
  return { ok: true, mensagem: "Horários salvos." };
}

export async function salvarConfiguracao(
  _estado: EstadoForm,
  dados: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const entrada: unknown = Object.fromEntries(dados);
  const resultado = configuracao.safeParse(entrada);
  if (!resultado.success) {
    return {
      ok: false,
      erros: z.flattenError(resultado.error).fieldErrors,
      mensagem: "Confira a configuração e tente novamente.",
    };
  }

  const { secao, ...campos } = resultado.data;
  const { error } = await atualizarConfig(supabase, campos);
  if (error)
    return { ok: false, mensagem: "Não foi possível salvar a configuração." };

  revalidarCatalogo();
  return {
    ok: true,
    mensagem:
      secao === "grade" ? "Preferência salva." : "Pausa manual atualizada.",
  };
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin/auth";
import {
  inserirCategoria,
  excluirCategoria as removerCategoria,
  atualizarCategoria as salvarCategoria,
} from "@/lib/admin/categorias";
import { revalidarCatalogo } from "@/lib/admin/revalidar";
import type { EstadoForm } from "@/types";

const nome = z
  .string("Informe o nome.")
  .trim()
  .min(1, "Informe o nome.")
  .max(60, "Use até 60 caracteres.");
const ordem = z
  .string("Informe a ordem.")
  .trim()
  .regex(/^\d{1,3}$/, "Informe um número inteiro de 0 a 999.")
  .transform(Number);
const identificador = z.object({ id: z.uuid("Categoria inválida.") });
const schemaCriacao = z.object({ nome, ordem });
const schemaEdicao = z.discriminatedUnion("campo", [
  identificador.extend({ campo: z.literal("nome"), nome }),
  identificador.extend({ campo: z.literal("ordem"), ordem }),
]);

export async function criarCategoria(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaCriacao.safeParse(Object.fromEntries(formData));
  if (!dados.success) {
    return { ok: false, erros: z.flattenError(dados.error).fieldErrors };
  }

  const resultado = await inserirCategoria(supabase, dados.data);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  return { ok: true, mensagem: "Categoria criada." };
}

export async function atualizarCategoria(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaEdicao.safeParse(Object.fromEntries(formData));
  if (!dados.success) {
    return {
      ok: false,
      mensagem: "Confira os dados da categoria.",
      erros: z.flattenError(dados.error).fieldErrors,
    };
  }

  const edicao = dados.data;
  const alteracao =
    edicao.campo === "nome" ? { nome: edicao.nome } : { ordem: edicao.ordem };
  const resultado = await salvarCategoria(supabase, edicao.id, alteracao);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  return { ok: true, mensagem: "Alteração salva." };
}

export async function excluirCategoria(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = identificador.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { ok: false, mensagem: "Categoria inválida." };

  const resultado = await removerCategoria(supabase, dados.data.id);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  redirect("/admin/categorias?resultado=excluida");
}

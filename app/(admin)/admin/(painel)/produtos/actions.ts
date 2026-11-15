"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin/auth";
import {
  inserirProduto,
  excluirProduto as removerProduto,
  alternarDisponivel as salvarDisponibilidade,
  atualizarProduto as salvarProduto,
} from "@/lib/admin/produtos";
import { revalidarCatalogo } from "@/lib/admin/revalidar";
import {
  schemaDisponibilidade,
  schemaEdicaoProduto,
  schemaProduto,
  schemaProdutoId,
} from "@/lib/admin/schemas";
import type { EstadoForm } from "@/types";

export async function criarProduto(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaProduto.safeParse(Object.fromEntries(formData));
  if (!dados.success)
    return { ok: false, erros: z.flattenError(dados.error).fieldErrors };

  const resultado = await inserirProduto(supabase, dados.data);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  redirect("/admin/produtos");
}

export async function atualizarProduto(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaEdicaoProduto.safeParse(Object.fromEntries(formData));
  if (!dados.success) {
    return {
      ok: false,
      mensagem: "Confira os dados do produto.",
      erros: z.flattenError(dados.error).fieldErrors,
    };
  }

  const { id, ...campos } = dados.data;
  const resultado = await salvarProduto(supabase, id, campos);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  return { ok: true, mensagem: "Produto atualizado." };
}

export async function alternarDisponivel(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaDisponibilidade.safeParse(Object.fromEntries(formData));
  if (!dados.success)
    return { ok: false, mensagem: "Disponibilidade inválida." };

  const resultado = await salvarDisponibilidade(
    supabase,
    dados.data.id,
    dados.data.disponivel,
  );
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  return { ok: true };
}

export async function excluirProduto(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaProdutoId.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { ok: false, mensagem: "Produto inválido." };

  const resultado = await removerProduto(supabase, dados.data.id);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  if (resultado.imagemPendente) redirect("/admin/produtos?imagemPendente=1");
  return { ok: true, mensagem: "Produto excluído." };
}

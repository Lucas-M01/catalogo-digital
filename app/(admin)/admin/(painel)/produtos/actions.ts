"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin/auth";
import {
  buscarImagemProduto,
  inserirProduto,
  excluirProduto as removerProduto,
  alternarDisponivel as salvarDisponibilidade,
  atualizarProduto as salvarProduto,
} from "@/lib/admin/produtos";
import { revalidarCatalogo } from "@/lib/admin/revalidar";
import {
  schemaDisponibilidade,
  schemaEdicaoProduto,
  schemaImagemProduto,
  schemaProduto,
  schemaProdutoId,
} from "@/lib/admin/schemas";
import type { EstadoForm } from "@/types";

const schemaExclusaoProduto = schemaProdutoId.extend({
  q: z.string().optional(),
});

export async function criarProduto(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const entrada = Object.fromEntries(formData);
  const dados = schemaProduto.safeParse(entrada);
  const imagem = schemaImagemProduto().safeParse(entrada);
  if (!dados.success || !imagem.success) {
    return {
      ok: false,
      erros: {
        ...(dados.success ? {} : z.flattenError(dados.error).fieldErrors),
        ...(imagem.success ? {} : z.flattenError(imagem.error).fieldErrors),
      },
    };
  }

  const resultado = await inserirProduto(supabase, {
    ...dados.data,
    ...imagem.data,
  });
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  redirect("/admin/produtos?resultado=criado");
}

export async function atualizarProduto(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const entrada = Object.fromEntries(formData);
  const dados = schemaEdicaoProduto.safeParse(entrada);
  if (!dados.success) {
    return {
      ok: false,
      mensagem: "Confira os dados do produto.",
      erros: z.flattenError(dados.error).fieldErrors,
    };
  }

  const { id, preservar_imagem, ...campos } = dados.data;
  const { data: atual, error } = await buscarImagemProduto(supabase, id);
  if (error)
    return {
      ok: false,
      mensagem: "Não foi possível carregar a imagem atual. Tente novamente.",
    };
  if (!atual) return { ok: false, mensagem: "Produto não encontrado." };

  const imagem = schemaImagemProduto(atual).safeParse(entrada);
  if (!imagem.success)
    return { ok: false, erros: z.flattenError(imagem.error).fieldErrors };

  const mudouImagem =
    preservar_imagem !== "1" &&
    (imagem.data.imagem_url !== atual.imagem_url ||
      imagem.data.imagem_path !== atual.imagem_path);
  const resultado = await salvarProduto(
    supabase,
    id,
    campos,
    mudouImagem ? { atual, nova: imagem.data } : undefined,
  );
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
  return {
    ok: true,
    mensagem: dados.data.disponivel
      ? "Produto visível na loja."
      : "Produto ocultado.",
  };
}

export async function excluirProduto(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaExclusaoProduto.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { ok: false, mensagem: "Produto inválido." };

  const resultado = await removerProduto(supabase, dados.data.id);
  if (!resultado.ok) return resultado;

  revalidarCatalogo();
  const parametros = new URLSearchParams(
    resultado.imagemPendente
      ? { imagemPendente: "1" }
      : { resultado: "excluido" },
  );
  if (dados.data.q) parametros.set("q", dados.data.q);
  redirect(`/admin/produtos?${parametros}`);
}

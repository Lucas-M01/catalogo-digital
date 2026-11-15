"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin/auth";
import { converterDataBrasilia } from "@/lib/admin/datas";
import { buscarPrecoProduto } from "@/lib/admin/produtos";
import {
  type DadosPromocao,
  encerrarAgora,
  existeSobreposicao,
  inserirPromocao,
  mensagemSobreposicao,
  excluirPromocao as removerPromocao,
  atualizarPromocao as salvarPromocao,
} from "@/lib/admin/promocoes";
import { revalidarCatalogo } from "@/lib/admin/revalidar";
import { schemaProduto } from "@/lib/admin/schemas";
import type { EstadoForm } from "@/types";

const dataBrasilia = z
  .string("Informe uma data e hora válidas.")
  .transform((valor, ctx) => {
    const data = converterDataBrasilia(valor);
    if (data !== null) return data;
    ctx.addIssue({
      code: "custom",
      message: "Informe uma data e hora válidas.",
    });
    return z.NEVER;
  });

const identificador = z.object({ id: z.uuid("Promoção inválida.") });
const camposPromocao = z.object({
  produto_id: z.uuid("Selecione um produto."),
  preco_promocional: schemaProduto.shape.preco,
  inicio: dataBrasilia,
  fim: z
    .union(
      [z.literal("").transform(() => null), dataBrasilia],
      "Informe uma data e hora válidas.",
    )
    .optional()
    .transform((valor) => valor ?? null),
});
const periodoValido = ({ inicio, fim }: DadosPromocao) =>
  fim === null || Date.parse(fim) > Date.parse(inicio);
const erroPeriodo = {
  path: ["fim"],
  message: "O fim deve ser posterior ao início.",
};
const schemaCriacao = camposPromocao.refine(periodoValido, erroPeriodo);
const schemaEdicao = camposPromocao
  .extend(identificador.shape)
  .refine(periodoValido, erroPeriodo);

const gravacoesPorProduto = new Map<string, Promise<void>>();

async function serializarGravacao<T>(
  produtoId: string,
  gravar: () => Promise<T>,
) {
  const anterior = gravacoesPorProduto.get(produtoId);
  let liberar: (() => void) | undefined;
  const pendente = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  gravacoesPorProduto.set(produtoId, pendente);

  try {
    await anterior;
    return await gravar();
  } finally {
    liberar?.();
    if (gravacoesPorProduto.get(produtoId) === pendente) {
      gravacoesPorProduto.delete(produtoId);
    }
  }
}

async function validarPromocao(
  supabase: SupabaseClient,
  dados: DadosPromocao,
  id?: string,
): Promise<EstadoForm | null> {
  const { preco, falhou } = await buscarPrecoProduto(
    supabase,
    dados.produto_id,
  );
  if (falhou)
    return {
      ok: false,
      mensagem:
        "Não foi possível consultar o preço do produto. Tente novamente.",
    };
  if (preco === null)
    return { ok: false, erros: { produto_id: ["Produto não encontrado."] } };
  if (dados.preco_promocional >= preco) {
    return {
      ok: false,
      erros: {
        preco_promocional: [
          "O preço promocional deve ser menor que o preço normal.",
        ],
      },
    };
  }

  const sobreposicao = await existeSobreposicao(supabase, dados, id);
  if (sobreposicao === null)
    return {
      ok: false,
      mensagem:
        "Não foi possível verificar o período da promoção. Tente novamente.",
    };
  if (sobreposicao) return { ok: false, mensagem: mensagemSobreposicao };
  return null;
}

export async function criarPromocao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaCriacao.safeParse(Object.fromEntries(formData));
  if (!dados.success)
    return { ok: false, erros: z.flattenError(dados.error).fieldErrors };

  const erro = await serializarGravacao(dados.data.produto_id, async () => {
    const invalida = await validarPromocao(supabase, dados.data);
    if (invalida) return invalida;

    const { error } = await inserirPromocao(supabase, dados.data);
    return error
      ? {
          ok: false,
          mensagem: "Não foi possível criar a promoção. Tente novamente.",
        }
      : null;
  });
  if (erro) return erro;

  revalidarCatalogo();
  redirect("/admin/promocoes");
}

export async function atualizarPromocao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = schemaEdicao.safeParse(Object.fromEntries(formData));
  if (!dados.success)
    return {
      ok: false,
      mensagem: "Confira os dados da promoção.",
      erros: z.flattenError(dados.error).fieldErrors,
    };

  const { id, ...promocao } = dados.data;
  const erro = await serializarGravacao(promocao.produto_id, async () => {
    const invalida = await validarPromocao(supabase, promocao, id);
    if (invalida) return invalida;

    const { data, error } = await salvarPromocao(supabase, id, promocao);
    if (error) {
      return {
        ok: false,
        mensagem: "Não foi possível atualizar a promoção. Tente novamente.",
      };
    }
    return data ? null : { ok: false, mensagem: "Promoção não encontrada." };
  });
  if (erro) return erro;

  revalidarCatalogo();
  redirect("/admin/promocoes");
}

export async function encerrarPromocao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = identificador.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { ok: false, mensagem: "Promoção inválida." };

  const { data, error } = await encerrarAgora(supabase, dados.data.id);
  if (error)
    return {
      ok: false,
      mensagem: "Não foi possível encerrar a promoção. Tente novamente.",
    };
  if (!data)
    return {
      ok: false,
      mensagem:
        "A promoção precisa estar em andamento para ser encerrada agora.",
    };

  revalidarCatalogo();
  return { ok: true, mensagem: "Promoção encerrada." };
}

export async function excluirPromocao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const dados = identificador.safeParse(Object.fromEntries(formData));
  if (!dados.success) return { ok: false, mensagem: "Promoção inválida." };

  const { data, error } = await removerPromocao(supabase, dados.data.id);
  if (error)
    return {
      ok: false,
      mensagem: "Não foi possível excluir a promoção. Tente novamente.",
    };
  if (!data) return { ok: false, mensagem: "Promoção não encontrada." };

  revalidarCatalogo();
  return { ok: true, mensagem: "Promoção excluída." };
}

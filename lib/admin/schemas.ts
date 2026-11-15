import "server-only";

import { z } from "zod";
import { converterPreco } from "@/lib/admin/preco";
import { lerEnvSupabase } from "@/lib/env";
import type { ImagemProduto } from "@/types";

const caixaMarcacao = z
  .literal("on")
  .optional()
  .transform((valor) => valor === "on");
const id = z.uuid("Produto inválido.");

export const schemaProduto = z.object({
  nome: z
    .string("Informe o nome.")
    .trim()
    .min(1, "Informe o nome.")
    .max(120, "Use até 120 caracteres."),
  descricao: z
    .string("Descrição inválida.")
    .trim()
    .max(1000, "Use até 1000 caracteres.")
    .optional()
    .transform((valor) => valor || null),
  preco: z.string("Informe o preço.").transform((valor, ctx) => {
    const preco = converterPreco(valor);
    if (preco === null) {
      ctx.addIssue({
        code: "custom",
        message:
          "Informe um preço válido entre 0 e 99.999.999,99, com até 2 casas decimais.",
      });
      return z.NEVER;
    }
    return preco;
  }),
  categoria_id: z.uuid("Selecione uma categoria válida."),
  disponivel: caixaMarcacao,
  destaque: caixaMarcacao,
  ordem: z
    .string("Informe a ordem.")
    .trim()
    .regex(/^\d{1,3}$/, "Informe um número inteiro de 0 a 999.")
    .transform(Number),
});

export const schemaEdicaoProduto = schemaProduto.extend({
  id,
  preservar_imagem: z.literal("1", "Opção de imagem inválida.").optional(),
});
export const schemaProdutoId = z.object({ id });
export const schemaDisponibilidade = schemaProdutoId.extend({
  disponivel: z
    .enum(["true", "false"], "Disponibilidade inválida.")
    .transform((valor) => valor === "true"),
});

export function schemaImagemProduto(atual?: ImagemProduto) {
  const { NEXT_PUBLIC_SUPABASE_URL } = lerEnvSupabase();
  const prefixo = `${NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/produtos/`;

  return z
    .object({
      imagem_url: z.string("URL de imagem inválida.").optional(),
      imagem_path: z
        .string("Caminho de imagem inválido.")
        .refine(
          (valor) => valor === "" || /^[0-9a-f-]{36}\.webp$/.test(valor),
          "Caminho de imagem inválido.",
        )
        .optional(),
    })
    .transform(({ imagem_url, imagem_path }) =>
      atual && imagem_url === undefined && imagem_path === undefined
        ? atual
        : { imagem_url: imagem_url || null, imagem_path: imagem_path || null },
    )
    .refine(
      ({ imagem_url, imagem_path }) => {
        if (imagem_url === null && imagem_path === null) return true;
        if (
          imagem_url !== null &&
          imagem_url === atual?.imagem_url &&
          imagem_path === atual.imagem_path
        )
          return true;
        return imagem_path !== null && imagem_url === prefixo + imagem_path;
      },
      {
        path: ["imagem_url"],
        message: "Use uma imagem enviada para o Storage desta loja.",
      },
    );
}

export type DadosProduto = z.output<typeof schemaProduto>;

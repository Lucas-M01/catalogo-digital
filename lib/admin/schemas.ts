import "server-only";

import { z } from "zod";
import { converterPreco } from "@/lib/admin/preco";

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

export const schemaEdicaoProduto = schemaProduto.extend({ id });
export const schemaProdutoId = z.object({ id });
export const schemaDisponibilidade = schemaProdutoId.extend({
  disponivel: z
    .enum(["true", "false"], "Disponibilidade inválida.")
    .transform((valor) => valor === "true"),
});

export type DadosProduto = z.output<typeof schemaProduto>;

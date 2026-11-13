import { calcularTotal, subtotalItem } from "@/lib/carrinho";
import type { ItemCarrinho } from "@/types";

export function gerarLinkWhatsApp(
  itens: readonly ItemCarrinho[],
  numeroWhatsApp: string,
): string {
  const linhas = itens.map(
    (item) =>
      `• ${item.quantidade}x ${item.produto.nome} — ${formatarPreco(
        subtotalItem(item),
      )}`,
  );

  const total = calcularTotal(itens);

  const mensagem = [
    "Olá! Gostaria de fazer um pedido:",
    "",
    "🛒 *Meu Pedido*",
    ...linhas,
    "",
    `*Total: ${formatarPreco(total)}*`,
    "",
    "Aguardo confirmação! 😊",
  ].join("\n");

  return `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

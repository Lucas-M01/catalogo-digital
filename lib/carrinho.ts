import type { ItemCarrinho, Produto } from "@/types";

export const QUANTIDADE_MAXIMA = 99;

export function precoUnitario(produto: Produto): number {
  return produto.preco_promocional ?? produto.preco;
}

export function subtotalItem({ produto, quantidade }: ItemCarrinho): number {
  return (Math.round(precoUnitario(produto) * 100) * quantidade) / 100;
}

export function calcularTotal(itens: readonly ItemCarrinho[]): number {
  return (
    itens.reduce(
      (total, item) => total + Math.round(subtotalItem(item) * 100),
      0,
    ) / 100
  );
}

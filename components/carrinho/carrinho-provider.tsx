"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { calcularTotal, QUANTIDADE_MAXIMA } from "@/lib/carrinho";
import type { ItemCarrinho, Produto } from "@/types";

type CarrinhoContextType = {
  itens: readonly ItemCarrinho[];
  total: number;
  totalItens: number;
  adicionar: (produto: Produto, quantidade?: number) => void;
  remover: (produtoId: string) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  limpar: () => void;
};

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  function adicionar(produto: Produto, quantidade = 1) {
    if (!Number.isInteger(quantidade) || quantidade < 1) return;

    setItens((anteriores) =>
      anteriores.some((item) => item.produto.id === produto.id)
        ? anteriores.map((item) =>
            item.produto.id === produto.id
              ? {
                  ...item,
                  quantidade: Math.min(
                    item.quantidade + quantidade,
                    QUANTIDADE_MAXIMA,
                  ),
                }
              : item,
          )
        : [
            ...anteriores,
            { produto, quantidade: Math.min(quantidade, QUANTIDADE_MAXIMA) },
          ],
    );
  }

  function remover(produtoId: string) {
    setItens((anteriores) =>
      anteriores.filter((item) => item.produto.id !== produtoId),
    );
  }

  function alterarQuantidade(produtoId: string, quantidade: number) {
    if (!Number.isInteger(quantidade)) return;
    if (quantidade < 1) {
      remover(produtoId);
      return;
    }

    setItens((anteriores) =>
      anteriores.map((item) =>
        item.produto.id === produtoId
          ? { ...item, quantidade: Math.min(quantidade, QUANTIDADE_MAXIMA) }
          : item,
      ),
    );
  }

  function limpar() {
    setItens([]);
  }

  const total = calcularTotal(itens);
  const totalItens = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <CarrinhoContext
      value={{
        itens,
        total,
        totalItens,
        adicionar,
        remover,
        alterarQuantidade,
        limpar,
      }}
    >
      {children}
    </CarrinhoContext>
  );
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) {
    throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider.");
  }
  return contexto;
}

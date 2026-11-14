"use client";

import { Minus, Plus } from "lucide-react";
import { useRef } from "react";
import { useCarrinho } from "@/components/carrinho/carrinho-provider";
import { Button } from "@/components/ui/button";
import { QUANTIDADE_MAXIMA } from "@/lib/carrinho";
import { cn } from "@/lib/utils";
import type { Produto } from "@/types";

export function BotaoAdicionar({
  produto,
  className,
  compacto = false,
}: {
  produto: Produto;
  className?: string;
  compacto?: boolean;
}) {
  const { itens, adicionar, alterarQuantidade } = useCarrinho();
  const botaoAdicionar = useRef<HTMLButtonElement>(null);
  const quantidade =
    itens.find((item) => item.produto.id === produto.id)?.quantidade ?? 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {quantidade > 0 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-12 min-w-12"
          aria-label={`Diminuir quantidade de ${produto.nome}`}
          onClick={() => {
            if (quantidade === 1) botaoAdicionar.current?.focus();
            alterarQuantidade(produto.id, quantidade - 1);
          }}
        >
          <Minus aria-hidden="true" />
        </Button>
      )}
      <output
        aria-live="polite"
        className={
          quantidade > 0 ? "flex-1 text-center tabular-nums" : "sr-only"
        }
      >
        <span className="sr-only">
          Quantidade de {produto.nome} no carrinho:{" "}
        </span>
        {quantidade}
      </output>
      <Button
        ref={botaoAdicionar}
        type="button"
        className={cn(
          "h-auto min-h-12 min-w-12 py-2 whitespace-normal",
          quantidade === 0 && "flex-1",
        )}
        disabled={quantidade >= QUANTIDADE_MAXIMA}
        aria-label={
          quantidade === 0
            ? `Adicionar ao carrinho — ${produto.nome}`
            : `Aumentar quantidade de ${produto.nome}`
        }
        onClick={() => adicionar(produto)}
      >
        <Plus aria-hidden="true" />
        {quantidade === 0 && (compacto ? "Adicionar" : "Adicionar ao carrinho")}
      </Button>
    </div>
  );
}

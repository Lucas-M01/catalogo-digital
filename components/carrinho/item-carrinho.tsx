"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCarrinho } from "@/components/carrinho/carrinho-provider";
import { Button } from "@/components/ui/button";
import { precoUnitario, QUANTIDADE_MAXIMA } from "@/lib/carrinho";
import { imagemProduto } from "@/lib/imagem-produto";
import { formatarPreco } from "@/lib/whatsapp";
import type { ItemCarrinho as Item } from "@/types";

export function ItemCarrinho({ produto, quantidade }: Item) {
  const { alterarQuantidade, remover } = useCarrinho();

  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 py-3">
      <div className="relative size-14 overflow-hidden rounded-md bg-muted">
        <Image
          {...imagemProduto(produto)}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="font-medium [overflow-wrap:anywhere]">{produto.nome}</p>
        <p className="text-sm text-muted-foreground">
          {formatarPreco(precoUnitario(produto))} / un.
        </p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-12 min-w-12"
            aria-label={`Diminuir quantidade de ${produto.nome}`}
            onClick={() => alterarQuantidade(produto.id, quantidade - 1)}
          >
            <Minus aria-hidden="true" />
          </Button>
          <span className="min-w-6 text-center tabular-nums">
            <span className="sr-only">Quantidade: </span>
            {quantidade}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-12 min-w-12"
            aria-label={`Aumentar quantidade de ${produto.nome}`}
            disabled={quantidade >= QUANTIDADE_MAXIMA}
            onClick={() => alterarQuantidade(produto.id, quantidade + 1)}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-12 min-w-12"
          aria-label={`Remover ${produto.nome}`}
          onClick={() => remover(produto.id)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

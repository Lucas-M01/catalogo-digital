"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCarrinho } from "@/components/carrinho/carrinho-provider";
import { Button } from "@/components/ui/button";
import { QUANTIDADE_MAXIMA } from "@/lib/carrinho";
import { cn } from "@/lib/utils";
import type { Produto } from "@/types";

export function BotaoAdicionar({
  produto,
  className,
}: {
  produto: Produto;
  className?: string;
}) {
  const { itens, adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const limiteAtingido =
    itens.find((item) => item.produto.id === produto.id)?.quantidade ===
    QUANTIDADE_MAXIMA;
  const texto = adicionado
    ? "Adicionado!"
    : limiteAtingido
      ? "Limite de 99 unidades"
      : "Adicionar ao carrinho";

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <Button
      type="button"
      className={cn("min-h-12 min-w-12", className)}
      disabled={limiteAtingido}
      aria-label={`${texto} — ${produto.nome}`}
      onClick={() => {
        adicionar(produto);
        setAdicionado(true);
        clearTimeout(temporizador.current);
        temporizador.current = setTimeout(() => setAdicionado(false), 1200);
      }}
    >
      {adicionado ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
      <span aria-live="polite">{texto}</span>
    </Button>
  );
}

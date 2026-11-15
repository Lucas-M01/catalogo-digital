"use client";

import { useLoja } from "@/components/loja/loja-provider";
import { textoLojaFechada } from "@/lib/loja-status";

export function FaixaStatusLoja() {
  const { status } = useLoja();
  if (status === null) return null;

  if (status.aberta) {
    if (!status.fechaAs || status.minutosParaFechar > 30) return null;
    return (
      <output className="block border-b">
        <span className="mx-auto block max-w-6xl px-3 py-2 text-sm text-muted-foreground md:px-6">
          Fecha às {status.fechaAs}
        </span>
      </output>
    );
  }

  return (
    <output className="block border-b bg-muted/50">
      <span className="mx-auto block max-w-6xl space-y-1 px-3 py-2 text-sm wrap-anywhere md:px-6">
        <span className="block font-medium">
          {textoLojaFechada(status.proximaAbertura)}
        </span>
        {status.mensagem && (
          <span className="block whitespace-pre-line text-muted-foreground">
            {status.mensagem}
          </span>
        )}
      </span>
    </output>
  );
}

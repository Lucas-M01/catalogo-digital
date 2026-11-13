"use client";

import { useCarrinho } from "@/components/carrinho/carrinho-provider";
import { Button } from "@/components/ui/button";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";

export function BotaoWhatsApp({ numeroWhatsApp }: { numeroWhatsApp: string }) {
  const { itens } = useCarrinho();
  const texto = "Enviar pedido pelo WhatsApp";

  if (itens.length === 0) {
    return (
      <Button type="button" className="min-h-12 w-full" disabled>
        {texto}
      </Button>
    );
  }

  return (
    <Button asChild className="min-h-12 w-full">
      <a
        href={gerarLinkWhatsApp(itens, numeroWhatsApp)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {texto}
      </a>
    </Button>
  );
}

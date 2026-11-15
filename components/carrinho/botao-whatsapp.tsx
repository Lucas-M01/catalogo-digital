"use client";

import { useCarrinho } from "@/components/carrinho/carrinho-provider";
import { useLoja } from "@/components/loja/loja-provider";
import { Button } from "@/components/ui/button";
import { textoLojaFechada } from "@/lib/loja-status";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";

export function BotaoWhatsApp({ numeroWhatsApp }: { numeroWhatsApp: string }) {
  const { itens } = useCarrinho();
  const { status, verificarStatus } = useLoja();
  const texto =
    status?.aberta === false
      ? textoLojaFechada(status.proximaAbertura)
      : "Enviar pedido pelo WhatsApp";

  function enviarPedido() {
    if (
      itens.length === 0 ||
      status === null ||
      !verificarStatus(new Date()).aberta
    )
      return;
    window.open(
      gerarLinkWhatsApp(itens, numeroWhatsApp),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Button
      type="button"
      className="h-auto min-h-12 w-full whitespace-normal py-2 text-center"
      disabled={itens.length === 0 || status?.aberta !== true}
      onClick={enviarPedido}
    >
      {texto}
    </Button>
  );
}

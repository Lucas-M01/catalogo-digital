"use client";

import { ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { BotaoWhatsApp } from "@/components/carrinho/botao-whatsapp";
import { useCarrinho } from "@/components/carrinho/carrinho-provider";
import { ItemCarrinho } from "@/components/carrinho/item-carrinho";
import { useLoja } from "@/components/loja/loja-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatarPreco } from "@/lib/whatsapp";

export function DrawerCarrinho({ numeroWhatsApp }: { numeroWhatsApp: string }) {
  const { itens, total, totalItens } = useCarrinho();
  const { status } = useLoja();
  const contagem = totalItens === 1 ? "1 item" : `${totalItens} itens`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 min-w-12 gap-2"
          aria-label={`Carrinho com ${contagem}`}
        >
          <ShoppingCart aria-hidden="true" className="size-5" />
          <span
            aria-hidden="true"
            className="rounded-full bg-muted px-2 py-0.5 text-sm"
          >
            {totalItens}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-x-0 bottom-0 max-h-[90dvh] rounded-t-xl border-t max-md:motion-safe:data-[state=open]:slide-in-from-bottom max-md:motion-safe:data-[state=closed]:slide-out-to-bottom md:inset-y-0 md:left-auto md:h-dvh md:max-h-none md:w-96 md:rounded-none md:border-t-0 md:border-l md:motion-safe:data-[state=open]:slide-in-from-right md:motion-safe:data-[state=closed]:slide-out-to-right">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2">
          <div>
            <SheetTitle className="text-lg font-semibold">
              Seu carrinho
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Confira os itens antes de enviar o pedido.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-12 min-w-12"
              aria-label="Fechar carrinho"
            >
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
          {itens.length > 0 ? (
            <ul className="divide-y">
              {itens.map((item) => (
                <ItemCarrinho key={item.produto.id} {...item} />
              ))}
            </ul>
          ) : (
            <div className="space-y-3 py-6 text-center">
              <p className="font-medium">Seu carrinho está vazio.</p>
              <p className="text-sm text-muted-foreground">
                Escolha algo no cardápio para começar seu pedido.
              </p>
              <SheetClose asChild>
                <Button asChild variant="outline" className="min-h-12 min-w-12">
                  <Link href="/">Ver produtos</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
        <div className="shrink-0 space-y-3 border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <p
            className="flex justify-between gap-3 font-semibold"
            aria-live="polite"
          >
            <span>Total</span>
            <span>{formatarPreco(total)}</span>
          </p>
          {status?.aberta === false && (
            <output className="block text-sm text-muted-foreground">
              Você pode montar o carrinho e enviar o pedido quando a loja abrir.
            </output>
          )}
          <BotaoWhatsApp numeroWhatsApp={numeroWhatsApp} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

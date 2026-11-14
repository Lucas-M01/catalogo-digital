import { Utensils } from "lucide-react";
import Link from "next/link";
import { DrawerCarrinho } from "@/components/carrinho/drawer-carrinho";
import { BotaoTema } from "@/components/layout/botao-tema";
import { numeroWhatsApp } from "@/lib/env";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 md:px-6">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 rounded-sm font-bold uppercase tracking-tight text-primary-hover focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Utensils
            aria-hidden="true"
            className="size-5 shrink-0 text-primary"
          />
          Cardápio Digital
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <BotaoTema />
          <DrawerCarrinho numeroWhatsApp={numeroWhatsApp} />
        </div>
      </div>
    </header>
  );
}

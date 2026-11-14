import { Utensils } from "lucide-react";
import Link from "next/link";
import { DrawerCarrinho } from "@/components/carrinho/drawer-carrinho";
import { numeroWhatsApp } from "@/lib/env";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 md:px-6">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Utensils
            aria-hidden="true"
            className="size-5 shrink-0 text-primary"
          />
          Cardápio Digital
        </Link>
        <DrawerCarrinho numeroWhatsApp={numeroWhatsApp} />
      </div>
    </header>
  );
}

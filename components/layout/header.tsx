import { ShoppingCart, Utensils } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 md:px-6">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Utensils aria-hidden="true" className="size-5" />
          Cardápio Digital
        </Link>
        <div className="flex min-h-12 items-center gap-2 text-muted-foreground">
          <ShoppingCart aria-hidden="true" className="size-5" />
          <span className="sr-only">Carrinho com 0 itens</span>
          <span
            aria-hidden="true"
            className="rounded-full bg-muted px-2 py-0.5 text-sm"
          >
            0
          </span>
        </div>
      </div>
    </header>
  );
}

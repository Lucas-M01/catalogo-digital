import { Clock, LayoutGrid, Package, Tag } from "lucide-react";
import Link from "next/link";
import { FormSair } from "@/components/admin/form-sair";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "@/types";

export const secoesAdmin = [
  { href: "/admin/produtos", nome: "Produtos", Icone: Package },
  { href: "/admin/categorias", nome: "Categorias", Icone: LayoutGrid },
  { href: "/admin/promocoes", nome: "Promoções", Icone: Tag },
  { href: "/admin/horarios", nome: "Horários", Icone: Clock },
] as const;

const estiloItem =
  "min-h-12 w-full min-w-0 flex-col gap-1 px-0.5 text-[11px] md:text-xs lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm";

export function NavegacaoAdmin({ sair }: { sair: () => Promise<EstadoForm> }) {
  return (
    <nav
      aria-label="Seções do painel"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-[1fr_1.1fr_1.15fr_1fr_0.85fr] border-border border-t bg-card px-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-2 lg:self-start lg:border-t-0 lg:border-r lg:p-4"
    >
      {secoesAdmin.map(({ href, nome, Icone }) => (
        <Button asChild key={href} variant="ghost" className={estiloItem}>
          <Link href={href}>
            <Icone aria-hidden="true" className="size-5" />
            {nome}
          </Link>
        </Button>
      ))}
      <FormSair action={sair} className={estiloItem} />
    </nav>
  );
}

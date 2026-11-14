import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/types";

type Props = {
  categorias: Categoria[];
  categoriaAtiva?: string;
};

export function Categorias({ categorias, categoriaAtiva }: Props) {
  const opcoes = [{ nome: "Todas", slug: "" }, ...categorias];

  return (
    <nav aria-label="Filtrar por categoria">
      <ul className="flex gap-2 overflow-x-auto p-1 md:flex-wrap">
        {opcoes.map(({ slug, nome }) => {
          const ativa = slug === (categoriaAtiva ?? "");
          return (
            <li key={slug} className="shrink-0">
              <Link
                href={
                  slug ? { pathname: "/", query: { categoria: slug } } : "/"
                }
                scroll={false}
                aria-current={ativa ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-12 items-center rounded-full border px-4 text-xs font-bold uppercase tracking-wide motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out",
                  ativa
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-primary-hover hover:border-primary hover:bg-accent",
                )}
              >
                {nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

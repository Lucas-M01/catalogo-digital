import type { Categoria } from "@/types";

type Props = { categorias: Categoria[] };

export function Categorias({ categorias }: Props) {
  return (
    <nav aria-label="Categorias">
      <ul className="flex gap-2 overflow-x-auto p-1 md:flex-wrap">
        {categorias.map(({ slug, nome }) => (
          <li key={slug} className="shrink-0">
            <a
              href={`#categoria-${slug}`}
              className="inline-flex min-h-12 items-center rounded-full border px-4 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              {nome}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

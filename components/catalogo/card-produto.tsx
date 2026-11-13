import Image from "next/image";
import Link from "next/link";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import type { Produto } from "@/types";

type Props = { produto: Produto };

export function CardProduto({ produto }: Props) {
  return (
    <article className="h-full rounded-xl border bg-card text-card-foreground">
      <Link
        href={`/produto/${produto.slug}`}
        aria-labelledby={`produto-${produto.id}`}
        className="group flex h-full min-h-12 flex-col overflow-hidden rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative grid aspect-[4/3] place-items-center bg-muted">
          {produto.imagem_url ? (
            <Image
              src={produto.imagem_url}
              alt=""
              fill
              sizes="(min-width: 1152px) 352px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw - 32px)"
              className="object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">Sem foto</span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <h3
            id={`produto-${produto.id}`}
            className="font-medium group-hover:underline"
          >
            {produto.nome}
          </h3>
          <PrecoProduto
            preco={produto.preco}
            preco_promocional={produto.preco_promocional}
          />
        </div>
      </Link>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import { imagemProduto } from "@/lib/imagem-produto";
import type { Produto } from "@/types";

type Props = { produto: Produto; preload: boolean };

export function CardProduto({ produto, preload }: Props) {
  return (
    <article className="flex h-full flex-col rounded-xl border bg-card text-card-foreground">
      <Link
        href={`/produto/${produto.slug}`}
        aria-labelledby={`produto-${produto.id}`}
        className="group flex min-h-12 flex-1 flex-col overflow-hidden rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            {...imagemProduto(produto)}
            fill
            preload={preload}
            sizes="(min-width: 72rem) 355.33px, (min-width: 64rem) calc((100vw - 80px) / 3 - 2px), (min-width: 48rem) calc(50vw - 34px), calc(100vw - 26px)"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <h3
            id={`produto-${produto.id}`}
            className="font-semibold [overflow-wrap:anywhere] group-hover:underline"
          >
            {produto.nome}
          </h3>
          <PrecoProduto
            preco={produto.preco}
            preco_promocional={produto.preco_promocional}
          />
        </div>
      </Link>
      <div className="px-4 pb-4">
        <BotaoAdicionar produto={produto} className="w-full" />
      </div>
    </article>
  );
}

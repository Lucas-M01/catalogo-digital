import Image from "next/image";
import Link from "next/link";
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import { imagemProduto } from "@/lib/imagem-produto";
import type { Produto } from "@/types";

type Props = { produto: Produto; preload: boolean };

export function CardProduto({ produto, preload }: Props) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-2 rounded-lg border bg-card p-2 text-card-foreground transition-colors hover:border-primary/60">
      <Link
        href={`/produto/${produto.slug}`}
        aria-labelledby={`produto-${produto.id}`}
        className="group flex min-h-12 flex-1 flex-col gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
          <Image
            {...imagemProduto(produto)}
            fill
            preload={preload}
            sizes="(min-width: 72rem) 252px, (min-width: 64rem) calc(25vw - 36px), (min-width: 48rem) calc(33.33vw - 40px), calc(50vw - 34px)"
            className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="break-words text-[11px] uppercase tracking-wider text-muted-foreground">
            {produto.categoria.nome}
          </p>
          <h3
            id={`produto-${produto.id}`}
            className="flex-1 text-sm font-semibold [overflow-wrap:anywhere] md:text-base group-hover:underline"
          >
            {produto.nome}
          </h3>
          <PrecoProduto
            preco={produto.preco}
            preco_promocional={produto.preco_promocional}
          />
        </div>
      </Link>
      <BotaoAdicionar
        produto={produto}
        compacto
        className="w-full text-xs font-bold"
      />
    </article>
  );
}

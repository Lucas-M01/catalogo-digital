import Image from "next/image";
import Link from "next/link";
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import { imagemProduto } from "@/lib/imagem-produto";
import type { Produto } from "@/types";

type Props = { produto: Produto; preload: boolean };

export function CardProduto({ produto, preload }: Props) {
  return (
    <article className="flex h-full flex-col rounded-xl border bg-card text-card-foreground motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out hover:border-primary/60 focus-within:border-primary/60">
      <Link
        href={`/produto/${produto.slug}`}
        aria-labelledby={`produto-${produto.id}`}
        className="group flex min-h-12 flex-1 flex-col overflow-hidden rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            {...imagemProduto(produto)}
            fill
            preload={preload}
            sizes="(min-width: 72rem) 355.33px, (min-width: 64rem) calc((100vw - 80px) / 3 - 2px), (min-width: 48rem) calc(50vw - 34px), calc(50vw - 18px)"
            className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-2 md:p-4">
          <h3
            id={`produto-${produto.id}`}
            className="font-semibold [overflow-wrap:anywhere] motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out group-hover:text-primary-hover"
          >
            {produto.nome}
          </h3>
          <p className="text-xs uppercase md:text-sm text-muted-foreground">
            {produto.categoria.nome}
          </p>
          <PrecoProduto
            preco={produto.preco}
            preco_promocional={produto.preco_promocional}
          />
        </div>
      </Link>
      <div className="px-2 pb-2 md:px-4 md:pb-4">
        <BotaoAdicionar
          produto={produto}
          className="w-full gap-1 md:gap-2"
          compacto
        />
      </div>
    </article>
  );
}

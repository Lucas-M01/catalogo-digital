import { ChevronRight, CircleCheck } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar";
import { ListaProdutos } from "@/components/catalogo/lista-produtos";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import { imagemProduto } from "@/lib/imagem-produto";
import {
  getProdutoBySlug,
  getProdutos,
  getProdutosPorCategoria,
} from "@/lib/produtos";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const produtos = await getProdutos();
  return produtos.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);

  if (!produto) return {};

  const description =
    produto.descricao ??
    `${produto.nome} no cardápio de ${produto.categoria.nome}.`;
  const { src, alt } = imagemProduto(produto);
  const { openGraph } = await parent;

  return {
    title: produto.nome,
    description,
    openGraph: {
      ...openGraph,
      title: produto.nome,
      description,
      images: [{ url: src, alt }],
    },
  };
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);
  if (!produto) notFound();

  const relacionados = (await getProdutosPorCategoria(produto.categoria.slug))
    .filter(({ id }) => id !== produto.id)
    .slice(0, 4);
  const categoriaHref = `/busca?categoria=${encodeURIComponent(produto.categoria.slug)}`;

  return (
    <div className="space-y-6">
      <nav aria-label="Você está em">
        <ol className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center hover:text-primary-hover"
            >
              Cardápio
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="size-4" />
            <Link
              href={categoriaHref}
              className="inline-flex min-h-12 items-center hover:text-primary-hover"
            >
              {produto.categoria.nome}
            </Link>
          </li>
          <li
            aria-current="page"
            className="flex min-w-0 items-center gap-1 text-foreground"
          >
            <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
            <span className="[overflow-wrap:anywhere]">{produto.nome}</span>
          </li>
        </ol>
      </nav>

      <article className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
          <Image
            {...imagemProduto(produto)}
            fill
            preload
            sizes="(min-width: 72rem) 526px, (min-width: 64rem) calc(50vw - 50px), (min-width: 48rem) calc(100vw - 50px), calc(100vw - 26px)"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 space-y-5">
          <div className="space-y-2">
            {produto.destaque && (
              <span className="inline-block rounded-lg border bg-card px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-hover">
                Destaque
              </span>
            )}
            <h1 className="text-3xl font-bold tracking-tight [overflow-wrap:anywhere]">
              {produto.nome}
            </h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {produto.categoria.nome}
            </p>
          </div>
          <div className="space-y-1">
            <PrecoProduto
              preco={produto.preco}
              preco_promocional={produto.preco_promocional}
              className="text-[28px]"
            />
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-hover">
              <CircleCheck aria-hidden="true" className="size-4" />
              Disponível
            </p>
          </div>
          {produto.descricao && (
            <section className="space-y-2 border-y py-4">
              <h2 className="font-semibold">Descrição</h2>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                {produto.descricao}
              </p>
            </section>
          )}
          <BotaoAdicionar produto={produto} className="w-full font-bold" />
        </div>
      </article>
      {relacionados.length > 0 && (
        <section
          aria-labelledby="relacionados"
          className="space-y-2 pt-6 lg:pt-12"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <h2 id="relacionados" className="text-lg font-bold">
              Produtos relacionados
            </h2>
            <Link
              href={categoriaHref}
              className="inline-flex min-h-12 items-center text-xs font-bold uppercase tracking-wide text-primary-hover hover:underline"
            >
              Ver categoria
            </Link>
          </div>
          <ListaProdutos produtos={relacionados} imagensPrioritarias={[]} />
        </section>
      )}
    </div>
  );
}

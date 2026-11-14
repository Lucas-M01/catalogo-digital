import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import { imagemProduto } from "@/lib/imagem-produto";
import { getProdutoBySlug, getProdutos } from "@/lib/produtos";

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

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex min-h-12 items-center rounded-sm text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        Voltar ao cardápio
      </Link>
      <article className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <Image
            {...imagemProduto(produto)}
            fill
            preload
            sizes="(min-width: 72rem) 540px, (min-width: 48rem) calc(50vw - 36px), calc(100vw - 32px)"
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {produto.categoria.nome}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight [overflow-wrap:anywhere]">
              {produto.nome}
            </h1>
          </div>
          <PrecoProduto
            preco={produto.preco}
            preco_promocional={produto.preco_promocional}
          />
          {produto.descricao && (
            <p className="max-w-prose">{produto.descricao}</p>
          )}
          <BotaoAdicionar produto={produto} className="w-full md:w-auto" />
        </div>
      </article>
    </div>
  );
}

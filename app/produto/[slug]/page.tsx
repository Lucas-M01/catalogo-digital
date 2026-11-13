import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrecoProduto } from "@/components/catalogo/preco-produto";
import { getProdutoBySlug, getProdutos } from "@/lib/produtos";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const produtos = await getProdutos();
  return produtos.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);

  return produto
    ? { title: produto.nome, description: produto.descricao ?? undefined }
    : {};
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
      <article className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-muted">
          {produto.imagem_url ? (
            <Image
              src={produto.imagem_url}
              alt={produto.nome}
              fill
              preload
              sizes="(min-width: 1152px) 540px, (min-width: 768px) 50vw, calc(100vw - 32px)"
              className="object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">Sem foto</span>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {produto.categoria.nome}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
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
        </div>
      </article>
    </div>
  );
}

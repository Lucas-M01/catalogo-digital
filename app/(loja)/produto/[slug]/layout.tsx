import { notFound } from "next/navigation";
import { getProdutoBySlug } from "@/lib/produtos";

export default async function LayoutProduto({
  children,
  params,
}: LayoutProps<"/produto/[slug]">) {
  const { slug } = await params;
  if (!(await getProdutoBySlug(slug))) notFound();
  return children;
}

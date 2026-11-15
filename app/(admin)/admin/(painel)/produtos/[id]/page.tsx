import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormProduto } from "@/components/admin/form-produto";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/admin/auth";
import { listarCategorias } from "@/lib/admin/categorias";
import { buscarProdutoPorId } from "@/lib/admin/produtos";
import { schemaProdutoId } from "@/lib/admin/schemas";
import { atualizarProduto } from "../actions";

export const metadata: Metadata = { title: "Editar produto" };

export default async function PaginaEditarProduto({
  params,
}: PageProps<"/admin/produtos/[id]">) {
  const { supabase } = await exigirAdmin();
  const dados = schemaProdutoId.safeParse(await params);
  if (!dados.success) notFound();

  const [{ produto, falhou }, categorias] = await Promise.all([
    buscarProdutoPorId(supabase, dados.data.id),
    listarCategorias(supabase),
  ]);
  if (!produto && !falhou) notFound();

  return (
    <div className="max-w-xl space-y-4">
      <Button asChild variant="outline" className="min-h-12 px-4">
        <Link href="/admin/produtos">Voltar aos produtos</Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Editar produto</h1>
      {produto ? (
        <FormProduto
          categorias={categorias}
          produto={produto}
          action={atualizarProduto}
        />
      ) : (
        <p className="text-sm text-destructive">
          Não foi possível carregar o produto. Recarregue a página para tentar
          novamente.
        </p>
      )}
    </div>
  );
}

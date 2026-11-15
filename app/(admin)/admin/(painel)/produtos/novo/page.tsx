import type { Metadata } from "next";
import Link from "next/link";
import { FormProduto } from "@/components/admin/form-produto";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/admin/auth";
import { listarCategorias } from "@/lib/admin/categorias";
import { criarProduto } from "../actions";

export const metadata: Metadata = { title: "Novo produto" };

export default async function PaginaNovoProduto() {
  const { supabase } = await exigirAdmin();
  const categorias = await listarCategorias(supabase);

  return (
    <div className="max-w-xl space-y-4">
      <Button asChild variant="outline" className="min-h-12 px-4">
        <Link href="/admin/produtos">Voltar aos produtos</Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
      <FormProduto categorias={categorias} action={criarProduto} />
    </div>
  );
}

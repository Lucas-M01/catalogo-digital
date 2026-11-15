import type { Metadata } from "next";
import Link from "next/link";
import { FormPromocao } from "@/components/admin/form-promocao";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/admin/auth";
import { dataParaCampoBrasilia } from "@/lib/admin/datas";
import { listarOpcoesProduto } from "@/lib/admin/produtos";
import { criarPromocao } from "../actions";

export const metadata: Metadata = { title: "Nova promoção" };

export default async function PaginaNovaPromocao({
  searchParams,
}: PageProps<"/admin/promocoes/nova">) {
  const { supabase } = await exigirAdmin();
  const [parametros, produtos] = await Promise.all([
    searchParams,
    listarOpcoesProduto(supabase),
  ]);
  const selecionado = produtos?.find(
    (produto) => produto.id === parametros.produto,
  );

  return (
    <div className="min-w-0 max-w-xl space-y-4">
      <Button asChild variant="outline" className="min-h-12 px-4">
        <Link href="/admin/promocoes">Voltar às promoções</Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Nova promoção</h1>
      <FormPromocao
        produtos={produtos}
        valores={{
          produto_id: selecionado?.id ?? "",
          preco_promocional: "",
          inicio: dataParaCampoBrasilia(new Date().toISOString()).slice(0, 16),
          fim: "",
        }}
        action={criarPromocao}
      />
    </div>
  );
}

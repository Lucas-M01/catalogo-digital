import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { FormPromocao } from "@/components/admin/form-promocao";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/admin/auth";
import { dataParaCampoBrasilia } from "@/lib/admin/datas";
import { listarOpcoesProduto } from "@/lib/admin/produtos";
import { buscarPromocaoPorId } from "@/lib/admin/promocoes";
import { atualizarPromocao } from "../actions";

export const metadata: Metadata = { title: "Editar promoção" };

export default async function PaginaEditarPromocao({
  params,
}: PageProps<"/admin/promocoes/[id]">) {
  const { supabase } = await exigirAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ promocao, falhou }, produtos] = await Promise.all([
    buscarPromocaoPorId(supabase, id),
    listarOpcoesProduto(supabase),
  ]);
  if (!promocao && !falhou) notFound();

  return (
    <div className="min-w-0 max-w-xl space-y-4">
      <Button asChild variant="outline" className="min-h-12 px-4">
        <Link href="/admin/promocoes">Voltar às promoções</Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Editar promoção</h1>
      {promocao ? (
        <FormPromocao
          produtos={produtos}
          promocaoId={promocao.id}
          valores={{
            produto_id: promocao.produto_id,
            preco_promocional: promocao.preco_promocional
              .toFixed(2)
              .replace(".", ","),
            inicio: dataParaCampoBrasilia(promocao.inicio),
            fim: promocao.fim ? dataParaCampoBrasilia(promocao.fim) : "",
          }}
          action={atualizarPromocao}
        />
      ) : (
        <p className="text-sm text-destructive">
          Não foi possível carregar a promoção. Recarregue a página para tentar
          novamente.
        </p>
      )}
    </div>
  );
}

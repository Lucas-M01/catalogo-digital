import type { Metadata } from "next";
import Link from "next/link";
import { CardProdutoAdmin } from "@/components/admin/card-produto-admin";
import { FeedbackAdmin } from "@/components/admin/feedback-admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { exigirAdmin } from "@/lib/admin/auth";
import { listarProdutos } from "@/lib/admin/produtos";
import { alternarDisponivel, excluirProduto } from "./actions";

export const metadata: Metadata = { title: "Produtos" };

export default async function PaginaProdutos({
  searchParams,
}: PageProps<"/admin/produtos">) {
  const { supabase } = await exigirAdmin();
  const params = await searchParams;
  const busca =
    (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const produtos = await listarProdutos(supabase, busca);
  const mensagem =
    params.resultado === "criado"
      ? "Produto criado."
      : params.resultado === "excluido"
        ? "Produto excluído."
        : undefined;

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <Button asChild className="min-h-12 px-4">
          <Link href="/admin/produtos/novo">Novo produto</Link>
        </Button>
      </div>
      <FeedbackAdmin mensagem={mensagem} />
      {params.imagemPendente === "1" && (
        <p
          role="alert"
          className="rounded-lg border border-border bg-card p-3 text-sm text-destructive"
        >
          Produto excluído. Não foi possível remover sua imagem do Storage.
        </p>
      )}
      <form
        action="/admin/produtos"
        className="grid items-end gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_auto]"
      >
        <div className="min-w-0 space-y-2">
          <Label htmlFor="busca-produto">Buscar por nome</Label>
          <input
            id="busca-produto"
            type="search"
            name="q"
            defaultValue={busca}
            className="min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          />
        </div>
        <Button type="submit" variant="outline" className="min-h-12 px-4">
          Buscar
        </Button>
      </form>
      {produtos === null && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os produtos. Recarregue a página para tentar
          novamente.
        </p>
      )}
      {produtos?.length === 0 && (
        <p className="text-muted-foreground">
          {busca
            ? "Nenhum produto encontrado para esse nome."
            : "Você ainda não tem produtos. Cadastre o primeiro para montar o catálogo."}
        </p>
      )}
      {produtos && produtos.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {produtos.map((produto) => (
            <li key={produto.id} className="min-w-0">
              <CardProdutoAdmin
                produto={produto}
                busca={busca}
                alternarDisponivel={alternarDisponivel}
                excluir={excluirProduto}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { FormCategoria } from "@/components/admin/form-categoria";
import { exigirAdmin } from "@/lib/admin/auth";
import { listarCategorias } from "@/lib/admin/categorias";
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
} from "./actions";

export const metadata: Metadata = { title: "Categorias" };

export default async function PaginaCategorias() {
  const { supabase } = await exigirAdmin();
  const categorias = await listarCategorias(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
      <section
        aria-labelledby="nova-categoria"
        className="space-y-4 rounded-xl border border-border bg-card p-4 md:max-w-md"
      >
        <h2 id="nova-categoria" className="text-lg font-semibold">
          Nova categoria
        </h2>
        <FormCategoria action={criarCategoria} />
      </section>
      <section aria-labelledby="categorias-cadastradas" className="space-y-3">
        <h2 id="categorias-cadastradas" className="text-lg font-semibold">
          Categorias cadastradas
        </h2>
        {categorias === null && (
          <p className="text-sm text-destructive">
            Não foi possível carregar as categorias. Recarregue a página para
            tentar novamente.
          </p>
        )}
        {categorias?.length === 0 && (
          <p className="text-muted-foreground">
            Você ainda não tem categorias. Crie a primeira para organizar o
            catálogo.
          </p>
        )}
        {categorias && categorias.length > 0 && (
          <ul className="grid gap-3 lg:grid-cols-2">
            {categorias.map(({ totalProdutos, ...categoria }) => (
              <li key={categoria.id}>
                <article
                  aria-labelledby={`categoria-${categoria.id}`}
                  className="grid gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <h3
                      id={`categoria-${categoria.id}`}
                      className="wrap-anywhere font-semibold"
                    >
                      {categoria.nome}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {totalProdutos.toLocaleString("pt-BR")}{" "}
                      {totalProdutos === 1 ? "produto" : "produtos"}
                    </p>
                  </div>
                  <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                    <FormCategoria
                      action={atualizarCategoria}
                      categoria={categoria}
                      campo="nome"
                    />
                    <FormCategoria
                      action={atualizarCategoria}
                      categoria={categoria}
                      campo="ordem"
                    />
                  </div>
                  <div className="border-border border-t pt-3">
                    <BotaoExcluir
                      id={categoria.id}
                      titulo={`Excluir “${categoria.nome}”?`}
                      descricao="A categoria será removida do catálogo. Esta ação é permanente."
                      action={excluirCategoria}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

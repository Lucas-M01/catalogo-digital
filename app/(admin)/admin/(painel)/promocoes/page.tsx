import type { Metadata } from "next";
import Link from "next/link";
import { CardPromocao } from "@/components/admin/card-promocao";
import { Button } from "@/components/ui/button";
import { exigirAdmin } from "@/lib/admin/auth";
import { listarPromocoes } from "@/lib/admin/promocoes";
import { encerrarPromocao, excluirPromocao } from "./actions";

export const metadata: Metadata = { title: "Promoções" };

const secoes = [
  { status: "ativa", titulo: "Ativas", vazio: "Nenhuma promoção ativa." },
  {
    status: "agendada",
    titulo: "Agendadas",
    vazio: "Nenhuma promoção agendada.",
  },
  {
    status: "expirada",
    titulo: "Expiradas",
    vazio: "Nenhuma promoção expirada.",
  },
] as const;

export default async function PaginaPromocoes() {
  const { supabase } = await exigirAdmin();
  const grupos = await listarPromocoes(supabase);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Promoções</h1>
        <Button asChild className="min-h-12 px-4">
          <Link href="/admin/promocoes/nova">Nova promoção</Link>
        </Button>
      </div>
      {grupos ? (
        <>
          <p className="text-sm text-muted-foreground">
            Fuso: horário de Brasília
          </p>
          {secoes.map(({ status, titulo, vazio }) => (
            <section
              key={status}
              aria-labelledby={`grupo-${status}`}
              className="space-y-3"
            >
              <h2 id={`grupo-${status}`} className="text-lg font-semibold">
                {titulo}
              </h2>
              {grupos[status].length === 0 ? (
                <p className="text-sm text-muted-foreground">{vazio}</p>
              ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                  {grupos[status].map((promocao) => (
                    <li key={promocao.id} className="min-w-0">
                      <CardPromocao
                        promocao={promocao}
                        excluir={excluirPromocao}
                        encerrar={
                          status === "ativa" ? encerrarPromocao : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </>
      ) : (
        <p className="text-sm text-destructive">
          Não foi possível carregar as promoções. Recarregue a página para
          tentar novamente.
        </p>
      )}
    </div>
  );
}

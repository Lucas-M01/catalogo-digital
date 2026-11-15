import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FeedbackAdmin } from "@/components/admin/feedback-admin";
import { secoesAdmin } from "@/components/admin/navegacao-admin";
import { exigirAdmin } from "@/lib/admin/auth";
import { lerDadosLojaAdmin } from "@/lib/admin/horarios";
import { contarProdutos } from "@/lib/admin/produtos";
import { contarPromocoesAtivas } from "@/lib/admin/promocoes";
import { calcularStatusLoja } from "@/lib/loja-status";

export default async function PaginaResumo({
  searchParams,
}: PageProps<"/admin">) {
  const { supabase } = await exigirAdmin();
  const [
    { total, ocultos },
    promocoesAtivas,
    { resultado },
    { horarios, config },
  ] = await Promise.all([
    contarProdutos(supabase),
    contarPromocoesAtivas(supabase),
    searchParams,
    lerDadosLojaAdmin(supabase),
  ]);
  const status =
    config && horarios
      ? calcularStatusLoja(horarios, config, new Date())
      : null;

  const contagens = [
    { nome: "Produtos", valor: total },
    { nome: "Produtos ocultos", valor: ocultos },
    { nome: "Promoções ativas", valor: promocoesAtivas },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Resumo</h1>
      <FeedbackAdmin
        mensagem={
          resultado === "sessao-iniciada" ? "Você entrou no painel." : undefined
        }
      />
      <section
        aria-labelledby="status-loja"
        className="space-y-2 rounded-xl border border-border bg-card p-4"
      >
        <h2
          id="status-loja"
          className="text-sm font-medium text-muted-foreground"
        >
          Horário de funcionamento
        </h2>
        <p className="text-lg font-semibold">
          {status === null
            ? "Status indisponível"
            : status.aberta
              ? "Loja aberta"
              : "Loja fechada"}
        </p>
        {status?.aberta && status.fechaAs && (
          <p className="text-sm">Fecha às {status.fechaAs}.</p>
        )}
        {status?.aberta === false && (
          <p className="text-sm">
            {status.proximaAbertura
              ? `Próxima abertura: ${status.proximaAbertura}.`
              : "Sem previsão de abertura."}
          </p>
        )}
      </section>
      <dl className="grid gap-3 md:grid-cols-3">
        {contagens.map(({ nome, valor }) => (
          <div
            key={nome}
            className="rounded-xl border border-border bg-card p-4"
          >
            <dt className="text-sm text-muted-foreground">{nome}</dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums">
              {valor?.toLocaleString("pt-BR") ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      {contagens.some(({ valor }) => valor === null) && (
        <p className="text-sm text-muted-foreground">
          Algumas contagens estão indisponíveis. Recarregue a página para tentar
          novamente.
        </p>
      )}
      <section className="space-y-3" aria-labelledby="atalhos">
        <h2 id="atalhos" className="text-lg font-semibold">
          Atalhos
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {secoesAdmin.map(({ href, nome, Icone }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-4 font-medium hover:bg-muted"
              >
                <Icone
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
                {nome}
                <ChevronRight
                  aria-hidden="true"
                  className="ml-auto size-4 text-muted-foreground"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

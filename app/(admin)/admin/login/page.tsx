import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FeedbackAdmin } from "@/components/admin/feedback-admin";
import { FormLogin } from "@/components/admin/form-login";
import { BotaoTema } from "@/components/layout/botao-tema";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { entrar } from "./actions";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function PaginaLogin({
  searchParams,
}: PageProps<"/admin/login">) {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) redirect("/admin");
  const { resultado } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-96 flex-1 flex-col justify-center px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-5 text-card-foreground md:p-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Entrar no painel
          </h1>
          <BotaoTema />
        </div>
        <div className="space-y-3">
          <FeedbackAdmin
            mensagem={
              resultado === "sessao-encerrada"
                ? "Você saiu do painel."
                : undefined
            }
          />
          <FormLogin action={entrar} />
        </div>
      </div>
    </main>
  );
}

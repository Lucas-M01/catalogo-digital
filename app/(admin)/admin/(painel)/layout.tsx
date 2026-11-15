import type { Metadata } from "next";
import Link from "next/link";
import { NavegacaoAdmin } from "@/components/admin/navegacao-admin";
import { BotaoTema } from "@/components/layout/botao-tema";
import { exigirAdmin } from "@/lib/admin/auth";
import { sair } from "./actions";

export const metadata: Metadata = {
  title: { default: "Painel da loja", template: "%s | Painel da loja" },
  robots: { index: false, follow: false },
};

export default async function LayoutPainel({
  children,
}: LayoutProps<"/admin">) {
  await exigirAdmin();

  return (
    <div className="flex min-h-dvh flex-1 flex-col lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <NavegacaoAdmin sair={sair} />
      <div>
        <header className="border-border border-b bg-card">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 md:px-6">
            <Link
              href="/admin"
              className="inline-flex min-h-12 items-center font-semibold"
            >
              Painel da loja
            </Link>
            <BotaoTema />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:px-6 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

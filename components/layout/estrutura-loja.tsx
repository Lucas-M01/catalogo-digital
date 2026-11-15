import type { ReactNode } from "react";
import { CarrinhoProvider } from "@/components/carrinho/carrinho-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FaixaStatusLoja } from "@/components/loja/faixa-status-loja";
import { LojaProvider } from "@/components/loja/loja-provider";
import type { ConfigLoja, HorarioFuncionamento } from "@/types";

export function EstruturaLoja({
  children,
  horarios,
  config,
}: {
  children: ReactNode;
  horarios: HorarioFuncionamento[];
  config: ConfigLoja;
}) {
  return (
    <CarrinhoProvider>
      <LojaProvider horarios={horarios} config={config}>
        <Header />
        <FaixaStatusLoja />
        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 md:px-6">
          {children}
        </main>
        <Footer horarios={config.usar_horarios ? horarios : null} />
      </LojaProvider>
    </CarrinhoProvider>
  );
}

import type { ReactNode } from "react";
import { CarrinhoProvider } from "@/components/carrinho/carrinho-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function EstruturaLoja({ children }: { children: ReactNode }) {
  return (
    <CarrinhoProvider>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 md:px-6">
        {children}
      </main>
      <Footer />
    </CarrinhoProvider>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CarrinhoProvider } from "@/components/carrinho/carrinho-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const nomeLoja = "Cardápio Digital";
const description =
  "Confira o cardápio, monte seu carrinho e envie seu pedido pelo WhatsApp.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: nomeLoja, template: `%s | ${nomeLoja}` },
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: nomeLoja,
    title: nomeLoja,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#12131a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CarrinhoProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 md:px-6">
            {children}
          </main>
          <Footer />
        </CarrinhoProvider>
      </body>
    </html>
  );
}

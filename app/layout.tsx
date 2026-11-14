import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { CarrinhoProvider } from "@/components/carrinho/carrinho-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  themeColor: "#fafaf9",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CarrinhoProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
            {children}
          </main>
          <Footer />
        </CarrinhoProvider>
      </body>
    </html>
  );
}

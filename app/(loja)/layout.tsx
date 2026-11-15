import type { Metadata } from "next";
import { EstruturaLoja } from "@/components/layout/estrutura-loja";
import { siteUrl } from "@/lib/env";
import { getDadosLoja } from "@/lib/loja";

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

export const revalidate = 300;

export default async function LayoutLoja({ children }: LayoutProps<"/">) {
  const dados = await getDadosLoja();
  return <EstruturaLoja {...dados}>{children}</EstruturaLoja>;
}

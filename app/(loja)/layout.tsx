import type { Metadata } from "next";
import { EstruturaLoja } from "@/components/layout/estrutura-loja";
import { siteUrl } from "@/lib/env";

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

export default function LayoutLoja({ children }: LayoutProps<"/">) {
  return <EstruturaLoja>{children}</EstruturaLoja>;
}

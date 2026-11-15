import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { scriptInicialTema } from "@/lib/tema";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-tema="escuro"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script>{scriptInicialTema}</script>
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

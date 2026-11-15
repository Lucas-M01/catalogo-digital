import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export function lerEnvSupabase() {
  // As variáveis NEXT_PUBLIC_* precisam ser lidas de forma literal
  // para o Next inserir o valor no bundle do navegador.
  return schema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

const numero = process.env.NEXT_PUBLIC_NUMERO_WHATSAPP?.trim();

if (!numero || !/^[1-9][0-9]{7,14}$/.test(numero)) {
  throw new Error(
    "Configure NEXT_PUBLIC_NUMERO_WHATSAPP com o código do país, DDD e número, usando apenas dígitos.",
  );
}

export const numeroWhatsApp = numero;

const url = new URL(process.env.SITE_URL?.trim() || "http://localhost:3000");
if (
  !["http:", "https:"].includes(url.protocol) ||
  url.href !== `${url.origin}/`
) {
  throw new Error("Configure SITE_URL com a origem HTTP ou HTTPS da loja.");
}

export const siteUrl = url;

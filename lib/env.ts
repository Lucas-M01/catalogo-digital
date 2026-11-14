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

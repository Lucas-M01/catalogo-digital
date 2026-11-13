const numero = process.env.NEXT_PUBLIC_NUMERO_WHATSAPP?.trim();

if (!numero || !/^[1-9][0-9]{7,14}$/.test(numero)) {
  throw new Error(
    "Configure NEXT_PUBLIC_NUMERO_WHATSAPP com o código do país, DDD e número, usando apenas dígitos.",
  );
}

export const numeroWhatsApp = numero;

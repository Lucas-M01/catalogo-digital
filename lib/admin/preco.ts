import "server-only";

const precoBrasileiro = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
const precoComPonto = /^\d+\.\d{1,2}$/;
const limiteEmCentavos = 9_999_999_999;

export function converterPreco(texto: string): number | null {
  const valor = texto.trim();
  let inteiro: string;
  let decimal: string | undefined;

  if (precoBrasileiro.test(valor)) {
    [inteiro, decimal] = valor.replaceAll(".", "").split(",");
  } else if (precoComPonto.test(valor)) {
    [inteiro, decimal] = valor.split(".");
  } else {
    return null;
  }

  const centavos =
    Number(inteiro) * 100 + Number((decimal ?? "").padEnd(2, "0"));
  if (centavos > limiteEmCentavos) return null;

  return centavos / 100;
}

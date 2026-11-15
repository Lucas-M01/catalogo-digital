import "server-only";

const fusoBrasilia = "America/Fortaleza";
const tresHoras = 3 * 60 * 60 * 1000;
const dataLocal =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

const formatoCampo = new Intl.DateTimeFormat("en-CA", {
  timeZone: fusoBrasilia,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23",
});

const formatoExibicao = new Intl.DateTimeFormat("pt-BR", {
  timeZone: fusoBrasilia,
  dateStyle: "short",
  timeStyle: "short",
});

export function converterDataBrasilia(valor: string): string | null {
  const partes = dataLocal.exec(valor);
  if (!partes || valor.startsWith("0000")) return null;

  const [, data, segundos = "00", fracao = "0"] = partes;
  const local = `${data}:${segundos}.${fracao.padEnd(3, "0")}`;
  const instante = Date.parse(`${local}-03:00`);
  if (!Number.isFinite(instante)) return null;
  // Date.parse pode normalizar datas inexistentes, como 29 de fevereiro em ano comum.
  if (new Date(instante - tresHoras).toISOString() !== `${local}Z`) return null;
  return new Date(instante).toISOString();
}

export function dataParaCampoBrasilia(iso: string): string {
  const partes = Object.fromEntries(
    formatoCampo
      .formatToParts(new Date(iso))
      .map(({ type, value }) => [type, value]),
  );
  const { year, month, day, hour, minute, second, fractionalSecond } = partes;
  const data = `${year.padStart(4, "0")}-${month}-${day}T${hour}:${minute}`;
  if (fractionalSecond !== "000")
    return `${data}:${second}.${fractionalSecond}`;
  return second === "00" ? data : `${data}:${second}`;
}

export function formatarDataBrasilia(iso: string) {
  return formatoExibicao.format(new Date(iso));
}

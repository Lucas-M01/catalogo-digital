import type { ConfigLoja, HorarioFuncionamento, StatusLoja } from "../types";

const DIAS_SEMANA = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
const MINUTOS_DIA = 24 * 60;
const MINUTOS_SEMANA = 7 * MINUTOS_DIA;

export function textoLojaFechada(proximaAbertura: string | null): string {
  return proximaAbertura
    ? `Loja fechada · abre ${proximaAbertura}`
    : "Loja fechada no momento";
}

const formatoLoja = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Fortaleza",
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partesEmFortaleza(data: Date) {
  return Object.fromEntries(
    formatoLoja.formatToParts(data).map(({ type, value }) => [type, value]),
  );
}

function paraMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":");
  return Number(horas) * 60 + Number(minutos);
}

function paraHora(minutos: number): string {
  const hora = Math.floor((minutos % MINUTOS_DIA) / 60);
  return `${String(hora).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

function textoProximaAbertura(diaAtual: number, inicio: number): string {
  const diasAteAbrir = Math.floor(inicio / MINUTOS_DIA);
  const dia =
    ["hoje", "amanhã"][diasAteAbrir] ??
    DIAS_SEMANA[(diaAtual + diasAteAbrir) % 7];
  return `${dia} às ${paraHora(inicio)}`;
}

function intervalosDaSemana(
  horarios: readonly HorarioFuncionamento[],
  diaAtual: number,
) {
  // Começar ontem inclui os intervalos que continuam após a meia-noite.
  return Array.from({ length: 9 }, (_, indice) => indice - 1)
    .flatMap((dia) =>
      horarios
        .filter(({ dia_semana }) => dia_semana === (diaAtual + dia + 7) % 7)
        .map(({ abre, fecha }) => {
          const abertura = paraMinutos(abre);
          const fechamento = paraMinutos(fecha);
          return {
            inicio: dia * MINUTOS_DIA + abertura,
            fim:
              dia * MINUTOS_DIA +
              fechamento +
              (fechamento < abertura ? MINUTOS_DIA : 0),
          };
        }),
    )
    .filter(({ inicio, fim }) => inicio < fim)
    .sort((a, b) => a.inicio - b.inicio);
}

export function calcularStatusLoja(
  horarios: readonly HorarioFuncionamento[],
  config: ConfigLoja,
  agora: Date,
): StatusLoja {
  const mensagem = config.mensagem_fechada;

  if (config.fechada_manualmente) {
    const reabreEm =
      config.reabre_em === null ? null : new Date(config.reabre_em);
    if (reabreEm === null || reabreEm > agora) {
      let proximaAbertura = null;
      if (reabreEm !== null) {
        const { day, month, hour, minute } = partesEmFortaleza(reabreEm);
        proximaAbertura = `dia ${day}/${month} às ${hour}:${minute}`;
      }
      return { aberta: false, motivo: "manual", proximaAbertura, mensagem };
    }
  }

  const abertaSemFechamento = {
    aberta: true,
    fechaAs: "",
    minutosParaFechar: Number.POSITIVE_INFINITY,
  } as const;
  if (!config.usar_horarios) return abertaSemFechamento;

  const { weekday, hour, minute } = partesEmFortaleza(agora);
  const diaAtual = DIAS_SEMANA.indexOf(weekday);
  const minutosAgora = Number(hour) * 60 + Number(minute);
  let fim = minutosAgora;

  for (const intervalo of intervalosDaSemana(horarios, diaAtual)) {
    if (intervalo.fim <= fim) continue;
    if (intervalo.inicio <= fim) {
      // Intervalos contíguos ou sobrepostos prolongam a abertura atual.
      fim = intervalo.fim;
      continue;
    }
    if (fim > minutosAgora) break;

    return {
      aberta: false,
      motivo: "horario",
      proximaAbertura: textoProximaAbertura(diaAtual, intervalo.inicio),
      mensagem,
    };
  }

  if (fim === minutosAgora) {
    return {
      aberta: false,
      motivo: "horario",
      proximaAbertura: null,
      mensagem,
    };
  }
  if (fim - minutosAgora >= MINUTOS_SEMANA) return abertaSemFechamento;
  return {
    aberta: true,
    fechaAs: paraHora(fim),
    minutosParaFechar: fim - minutosAgora,
  };
}

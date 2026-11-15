import assert from "node:assert/strict";
import { calcularStatusLoja } from "../lib/loja-status.ts";
import type { ConfigLoja, HorarioFuncionamento, StatusLoja } from "../types";

const config: ConfigLoja = {
  usar_horarios: true,
  fechada_manualmente: false,
  reabre_em: null,
  mensagem_fechada: null,
};

const sexta = [{ dia_semana: 5, abre: "18:00", fecha: "23:00" }];
const noturno = [{ dia_semana: 5, abre: "18:00", fecha: "02:00" }];
const segunda = { dia_semana: 1, abre: "11:00", fecha: "14:00" };
const sabado = { dia_semana: 6, abre: "11:00", fecha: "23:00" };
const mensagem = "Voltamos em breve.";

function verificar(
  horarios: HorarioFuncionamento[],
  instanteUtc: string,
  esperado: StatusLoja,
  configuracao = config,
) {
  assert.deepEqual(
    calcularStatusLoja(horarios, configuracao, new Date(instanteUtc)),
    esperado,
    instanteUtc,
  );
}

verificar(
  [],
  "2026-11-20T20:59:00Z",
  { aberta: true, fechaAs: "", minutosParaFechar: Number.POSITIVE_INFINITY },
  { ...config, usar_horarios: false },
);

verificar(sexta, "2026-11-20T20:59:00Z", {
  aberta: false,
  motivo: "horario",
  proximaAbertura: "hoje às 18:00",
  mensagem: null,
});
verificar(sexta, "2026-11-20T21:00:00Z", {
  aberta: true,
  fechaAs: "23:00",
  minutosParaFechar: 300,
});
verificar(sexta, "2026-11-21T01:59:59Z", {
  aberta: true,
  fechaAs: "23:00",
  minutosParaFechar: 1,
});
verificar(sexta, "2026-11-21T02:00:00Z", {
  aberta: false,
  motivo: "horario",
  proximaAbertura: "sexta-feira às 18:00",
  mensagem: null,
});

verificar([segunda, sabado], "2026-11-22T02:01:00Z", {
  aberta: false,
  motivo: "horario",
  proximaAbertura: "segunda-feira às 11:00",
  mensagem: null,
});
verificar(noturno, "2026-11-21T04:59:00Z", {
  aberta: true,
  fechaAs: "02:00",
  minutosParaFechar: 1,
});
verificar(noturno, "2026-11-21T05:00:00Z", {
  aberta: false,
  motivo: "horario",
  proximaAbertura: "sexta-feira às 18:00",
  mensagem: null,
});
verificar(
  [
    { dia_semana: 5, abre: "18:00", fecha: "22:00" },
    { dia_semana: 5, abre: "11:00", fecha: "14:00" },
  ],
  "2026-11-20T18:00:00Z",
  {
    aberta: false,
    motivo: "horario",
    proximaAbertura: "hoje às 18:00",
    mensagem: null,
  },
);
verificar(
  [sexta[0], sabado],
  "2026-11-21T02:15:00Z",
  {
    aberta: false,
    motivo: "horario",
    proximaAbertura: "amanhã às 11:00",
    mensagem,
  },
  { ...config, mensagem_fechada: mensagem },
);

const pausaManual: ConfigLoja = {
  ...config,
  fechada_manualmente: true,
  mensagem_fechada: mensagem,
};
verificar(
  [],
  "2026-11-20T11:59:00Z",
  {
    aberta: false,
    motivo: "manual",
    proximaAbertura: "dia 20/11 às 09:00",
    mensagem,
  },
  {
    ...pausaManual,
    usar_horarios: false,
    reabre_em: "2026-11-20T12:00:00Z",
  },
);
for (const [agora, minutosParaFechar] of [
  ["2026-11-20T21:00:00Z", 300],
  ["2026-11-20T21:01:00Z", 299],
] as const) {
  verificar(
    sexta,
    agora,
    { aberta: true, fechaAs: "23:00", minutosParaFechar },
    { ...pausaManual, reabre_em: "2026-11-20T21:00:00Z" },
  );
}
verificar(
  sexta,
  "2026-11-20T21:00:00Z",
  { aberta: false, motivo: "manual", proximaAbertura: null, mensagem },
  pausaManual,
);
verificar([], "2026-11-21T02:15:00Z", {
  aberta: false,
  motivo: "horario",
  proximaAbertura: null,
  mensagem: null,
});
verificar(
  [...noturno, { dia_semana: 6, abre: "02:00", fecha: "03:00" }],
  "2026-11-21T04:59:00Z",
  { aberta: true, fechaAs: "03:00", minutosParaFechar: 61 },
);
verificar(
  [{ dia_semana: 6, abre: "18:00", fecha: "02:00" }],
  "2026-11-22T03:00:00Z",
  { aberta: true, fechaAs: "02:00", minutosParaFechar: 120 },
);

console.log("Todos os cenários de status da loja passaram.");

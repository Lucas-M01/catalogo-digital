"use client";

import { useActionState, useState } from "react";
import { FeedbackAdmin } from "@/components/admin/feedback-admin";
import { useFocoErro } from "@/components/admin/use-foco-erro";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { EstadoForm, HorarioFuncionamento } from "@/types";

const dias = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
const turnos = [0, 1] as const;
const intervaloVazio = { abre: "", fecha: "" };
type Intervalo = typeof intervaloVazio;

function CardDia({
  dia,
  intervalos,
  editar,
  copiar,
  erros,
}: {
  dia: number;
  intervalos: Intervalo[];
  editar: (intervalos: Intervalo[]) => void;
  copiar: () => void;
  erros?: EstadoForm["erros"];
}) {
  const aberto = intervalos.length > 0;
  const id = `dia-${dia}`;

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <h3 id={`${id}-titulo`} className="font-semibold">
          {dias[dia]}
        </h3>
        <Label className="min-h-12 gap-3 pr-1" htmlFor={id}>
          {aberto ? "Aberto" : "Fechado"}
          <Switch
            id={id}
            aria-label={`Abrir: ${dias[dia]}`}
            checked={aberto}
            onCheckedChange={(ativar) => editar(ativar ? [intervaloVazio] : [])}
          />
        </Label>
      </div>
      {erros?.[dia]?.[0] && (
        <p className="text-sm text-destructive" role="alert">
          {erros[dia][0]}
        </p>
      )}
      {turnos.map(
        (turno) =>
          intervalos[turno] && (
            <fieldset key={turno} className="grid min-w-0 grid-cols-2 gap-2">
              <legend className="mb-2 text-sm font-medium">
                Intervalo {turno + 1}
              </legend>
              {(["abre", "fecha"] as const).map((campo) => {
                const campoId = `${id}-${turno}-${campo}`;
                const erro = erros?.[`${dia}.${turno}.${campo}`]?.[0];
                return (
                  <div key={campo} className="min-w-0 space-y-2">
                    <Label htmlFor={campoId}>
                      {campo === "abre" ? "Abre às" : "Fecha às"}
                    </Label>
                    <input
                      id={campoId}
                      type="time"
                      required
                      value={intervalos[turno][campo]}
                      aria-invalid={erro ? true : undefined}
                      aria-describedby={erro ? `${campoId}-erro` : undefined}
                      onChange={({ target }) =>
                        editar(
                          intervalos.map((valor, indice) =>
                            indice === turno
                              ? { ...valor, [campo]: target.value }
                              : valor,
                          ),
                        )
                      }
                      className="min-h-12 w-full min-w-0 rounded-lg border border-input bg-background px-1 text-base outline-ring aria-invalid:border-destructive"
                    />
                    {erro && (
                      <p
                        id={`${campoId}-erro`}
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {erro}
                      </p>
                    )}
                  </div>
                );
              })}
            </fieldset>
          ),
      )}
      {aberto && (
        <Button
          type="button"
          variant="outline"
          className="min-h-12 w-full"
          onClick={() =>
            editar(
              intervalos.length === 1
                ? [...intervalos, intervaloVazio]
                : intervalos.slice(0, 1),
            )
          }
        >
          {intervalos.length === 1
            ? "Adicionar intervalo"
            : "Remover 2º intervalo"}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        className="min-h-12 w-full"
        onClick={copiar}
      >
        Copiar para todos os dias
      </Button>
    </section>
  );
}

export function FormHorarios({
  horarios,
  action,
}: {
  horarios: HorarioFuncionamento[];
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pendente] = useActionState(action, { ok: false });
  const formulario = useFocoErro(estado, pendente);
  const [semana, setSemana] = useState<Intervalo[][]>(() =>
    dias.map((_, dia) =>
      horarios
        .filter(({ dia_semana }) => dia_semana === dia)
        .map(({ abre, fecha }) => ({ abre, fecha })),
    ),
  );
  const [diaCopiado, setDiaCopiado] = useState<number | null>(null);

  return (
    <form
      ref={formulario}
      action={formAction}
      onResetCapture={(evento) => {
        // O Switch do Radix restaura o valor inicial no reset nativo.
        evento.preventDefault();
        evento.stopPropagation();
      }}
      noValidate
      aria-busy={pendente}
      className="space-y-4"
    >
      <input type="hidden" name="semana" value={JSON.stringify(semana)} />
      <fieldset
        disabled={pendente}
        className="grid min-w-0 gap-3 md:grid-cols-2"
      >
        <legend className="sr-only">Intervalos da semana</legend>
        {dias.map((nome, dia) => (
          <CardDia
            key={nome}
            dia={dia}
            intervalos={semana[dia]}
            erros={estado.erros}
            editar={(intervalos) => {
              setDiaCopiado(null);
              setSemana((anterior) =>
                anterior.map((atual, indice) =>
                  indice === dia ? intervalos : atual,
                ),
              );
            }}
            copiar={() => {
              setSemana((anterior) => dias.map(() => anterior[dia]));
              setDiaCopiado(dia);
            }}
          />
        ))}
      </fieldset>
      {diaCopiado !== null && (
        <output className="block text-sm">
          Horários de {dias[diaCopiado].toLocaleLowerCase("pt-BR")} copiados
          para todos os dias.
        </output>
      )}
      {estado.ok ? (
        <FeedbackAdmin mensagem={estado.mensagem} />
      ) : (
        estado.mensagem && (
          <p role="alert" tabIndex={-1} className="text-sm text-destructive">
            {estado.mensagem}
          </p>
        )
      )}
      <Button
        type="submit"
        disabled={pendente}
        className="min-h-12 w-full md:w-fit"
      >
        {pendente ? "Salvando…" : "Salvar horários da semana"}
      </Button>
    </form>
  );
}

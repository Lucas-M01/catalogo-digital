"use client";

import { useActionState, useState } from "react";
import { FeedbackAdmin } from "@/components/admin/feedback-admin";
import { useFocoErro } from "@/components/admin/use-foco-erro";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { EstadoForm } from "@/types";

type Valores = {
  ligado: boolean;
} & ({ secao: "grade" } | { secao: "pausa"; reabre: string; mensagem: string });

export function FormConfigLoja({
  valores,
  action,
}: {
  valores: Valores;
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pendente] = useActionState(action, { ok: false });
  const form = useFocoErro(estado, pendente);
  const pausa = valores.secao === "pausa";
  const [ligado, setLigado] = useState(valores.ligado);
  const [reabre, setReabre] = useState(pausa ? valores.reabre : "");
  const [mensagem, setMensagem] = useState(pausa ? valores.mensagem : "");
  const nome = pausa ? "fechada_manualmente" : "usar_horarios";

  function erro(campo: string) {
    return estado.erros?.[campo]?.[0];
  }

  return (
    <form
      ref={form}
      action={formAction}
      onResetCapture={(evento) => {
        evento.preventDefault();
        evento.stopPropagation();
      }}
      noValidate
      aria-busy={pendente}
      className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <input type="hidden" name="secao" value={valores.secao} />
      <input type="hidden" name={nome} value={String(ligado)} />
      <Label
        htmlFor={nome}
        className="min-h-12 justify-between gap-3 pr-1 text-base"
      >
        {pausa ? "Fechar manualmente" : "Usar horário de funcionamento"}
        <Switch
          id={nome}
          checked={ligado}
          onCheckedChange={setLigado}
          disabled={pendente}
          aria-describedby={`${nome}-ajuda`}
        />
      </Label>
      <p id={`${nome}-ajuda`} className="text-sm text-muted-foreground">
        {pausa
          ? "Sem data de reabertura, a loja fica fechada até você desligar o interruptor e salvar."
          : "Com esta opção desligada, a loja fica sempre aberta pelo horário. A pausa manual ainda pode fechá-la."}
      </p>
      {pausa && (
        <fieldset className="grid min-w-0 gap-4" disabled={pendente}>
          <legend className="sr-only">Detalhes da pausa</legend>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="reabre_em">Reabre em (opcional)</Label>
            <input
              id="reabre_em"
              name="reabre_em"
              type="datetime-local"
              step="any"
              value={reabre}
              onChange={({ target }) => setReabre(target.value)}
              aria-invalid={erro("reabre_em") ? true : undefined}
              aria-describedby={
                erro("reabre_em") ? "fuso-reabre erro-reabre" : "fuso-reabre"
              }
              className="block min-h-12 w-full min-w-0 rounded-lg border border-input bg-background px-2 text-base outline-ring aria-invalid:border-destructive"
            />
            <p id="fuso-reabre" className="text-sm text-muted-foreground">
              Horário de Brasília
            </p>
            {erro("reabre_em") && (
              <p
                className="text-sm text-destructive"
                id="erro-reabre"
                role="alert"
              >
                {erro("reabre_em")}
              </p>
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="mensagem_fechada">
              Mensagem de loja fechada (opcional)
            </Label>
            <Textarea
              id="mensagem_fechada"
              name="mensagem_fechada"
              maxLength={200}
              value={mensagem}
              onChange={({ target }) => setMensagem(target.value)}
              aria-invalid={erro("mensagem_fechada") ? true : undefined}
              aria-describedby={
                erro("mensagem_fechada") ? "erro-mensagem" : undefined
              }
              className="min-h-16 text-base"
            />
            {erro("mensagem_fechada") && (
              <p
                className="text-sm text-destructive"
                id="erro-mensagem"
                role="alert"
              >
                {erro("mensagem_fechada")}
              </p>
            )}
          </div>
        </fieldset>
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
        {pendente
          ? "Salvando…"
          : pausa
            ? "Salvar pausa manual"
            : "Salvar preferência"}
      </Button>
    </form>
  );
}

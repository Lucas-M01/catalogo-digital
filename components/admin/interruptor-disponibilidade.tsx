"use client";

import { startTransition, useActionState, useId } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { EstadoForm } from "@/types";

export function InterruptorDisponibilidade({
  id,
  disponivel,
  action,
}: {
  id: string;
  disponivel: boolean;
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
}) {
  const campoId = useId();
  const [estado, enviar, pendente] = useActionState(action, { ok: false });

  function alternar(proximaDisponibilidade: boolean) {
    const dados = new FormData();
    dados.set("id", id);
    dados.set("disponivel", String(proximaDisponibilidade));
    startTransition(() => enviar(dados));
  }

  return (
    <div className="space-y-2">
      <div
        className="flex min-h-12 items-center justify-between gap-3 px-3"
        aria-busy={pendente}
      >
        <Label htmlFor={campoId} className="min-h-12 cursor-pointer">
          Disponível
        </Label>
        <Switch
          id={campoId}
          checked={disponivel}
          disabled={pendente}
          onCheckedChange={alternar}
        />
      </div>
      {estado.mensagem &&
        (estado.ok ? (
          <output className="text-sm text-muted-foreground">
            {estado.mensagem}
          </output>
        ) : (
          <p role="alert" className="text-sm text-destructive">
            {estado.mensagem}
          </p>
        ))}
    </div>
  );
}

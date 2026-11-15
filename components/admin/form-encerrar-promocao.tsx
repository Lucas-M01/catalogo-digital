"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "@/types";

export function FormEncerrarPromocao({
  id,
  action,
}: {
  id: string;
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pendente] = useActionState(action, { ok: false });
  return (
    <form action={formAction} aria-busy={pendente}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="secondary"
        className="min-h-12 px-4"
        disabled={pendente}
      >
        {pendente ? "Encerrando…" : "Encerrar agora"}
      </Button>
      {!estado.ok && estado.mensagem && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "@/types";

type Props = {
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
};

const estiloCampo =
  "min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring";

export function FormLogin({ action }: Props) {
  const [estado, formAction, pendente] = useActionState(action, { ok: false });
  const erro = estado.mensagem ? "erro-login" : undefined;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      aria-busy={pendente}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          required
          aria-describedby={erro}
          className={estiloCampo}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={erro}
          className={estiloCampo}
        />
      </div>
      {estado.mensagem && (
        <p id="erro-login" role="alert" className="text-sm text-destructive">
          {estado.mensagem}
        </p>
      )}
      <Button type="submit" className="min-h-12" disabled={pendente}>
        {pendente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

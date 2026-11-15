"use client";

import { LogOut } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "@/types";

type Props = {
  action: () => Promise<EstadoForm>;
  className: string;
};

export function FormSair({ action, className }: Props) {
  const [estado, formAction, pendente] = useActionState(action, { ok: false });

  return (
    <form action={formAction} className="relative lg:mt-auto">
      <Button
        type="submit"
        variant="ghost"
        className={className}
        disabled={pendente}
      >
        <LogOut aria-hidden="true" className="size-5" />
        {pendente ? "Saindo…" : "Sair"}
      </Button>
      {estado.mensagem && (
        <p
          role="alert"
          className="absolute right-0 bottom-full mb-2 w-56 rounded-lg border border-border bg-card p-3 text-sm text-destructive lg:static lg:mt-2 lg:mb-0 lg:w-auto"
        >
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}

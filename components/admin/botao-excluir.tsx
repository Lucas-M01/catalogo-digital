"use client";

import { useActionState, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "@/types";

type Props = {
  id: string;
  titulo: string;
  descricao: string;
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
};

export function BotaoExcluir(props: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="min-h-12 px-4">
          Excluir
        </Button>
      </AlertDialogTrigger>
      {aberto && (
        <ConfirmarExclusao {...props} fechar={() => setAberto(false)} />
      )}
    </AlertDialog>
  );
}

function ConfirmarExclusao({
  id,
  titulo,
  descricao,
  action,
  fechar,
}: Props & { fechar: () => void }) {
  const [estado, formAction, pendente] = useActionState(
    async (anterior: EstadoForm, dados: FormData) => {
      const resultado = await action(anterior, dados);
      if (resultado.ok) fechar();
      return resultado;
    },
    { ok: false },
  );

  return (
    <AlertDialogContent
      onEscapeKeyDown={(event) => {
        if (pendente) event.preventDefault();
      }}
    >
      <AlertDialogHeader>
        <AlertDialogTitle>{titulo}</AlertDialogTitle>
        <AlertDialogDescription>{descricao}</AlertDialogDescription>
      </AlertDialogHeader>
      <form action={formAction} aria-busy={pendente} className="grid gap-4">
        <input type="hidden" name="id" value={id} />
        {estado.mensagem && (
          <p role="alert" className="text-sm text-destructive">
            {estado.mensagem}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pendente}>Cancelar</AlertDialogCancel>
          <Button
            type="submit"
            variant="destructive"
            className="min-h-12 px-4"
            disabled={pendente}
          >
            {pendente ? "Excluindo…" : "Confirmar exclusão"}
          </Button>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  );
}

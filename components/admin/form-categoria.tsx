"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Categoria, EstadoForm } from "@/types";

type Props = {
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
} & (
  | { categoria?: undefined; campo?: undefined }
  | { categoria: Categoria; campo: "nome" | "ordem" }
);

const estiloCampo =
  "min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-invalid:border-destructive";

export function FormCategoria({ action, categoria, campo }: Props) {
  const id = useId();
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [ordem, setOrdem] = useState(String(categoria?.ordem ?? 0));
  const [estado, formAction, pendente] = useActionState(
    async (anterior: EstadoForm, dados: FormData) => {
      const resultado = await action(anterior, dados);
      if (resultado.ok && !categoria) {
        setNome("");
        setOrdem("0");
      }
      return resultado;
    },
    { ok: false },
  );

  const erroNome = estado.erros?.nome?.[0];
  const erroOrdem = estado.erros?.ordem?.[0];
  const rotuloBotao =
    campo === "nome"
      ? "Salvar nome"
      : campo === "ordem"
        ? "Salvar ordem"
        : "Criar categoria";

  return (
    <form
      action={formAction}
      aria-busy={pendente}
      className="grid gap-3"
      noValidate
    >
      {categoria && (
        <>
          <input type="hidden" name="id" value={categoria.id} />
          <input type="hidden" name="campo" value={campo} />
        </>
      )}
      {campo !== "ordem" && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-nome`}>Nome</Label>
          <input
            id={`${id}-nome`}
            name="nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            maxLength={60}
            required
            disabled={pendente}
            aria-invalid={erroNome ? true : undefined}
            aria-describedby={erroNome ? `${id}-erro-nome` : undefined}
            className={estiloCampo}
          />
          {erroNome && (
            <p
              id={`${id}-erro-nome`}
              role="alert"
              className="text-sm text-destructive"
            >
              {erroNome}
            </p>
          )}
        </div>
      )}
      {campo !== "nome" && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-ordem`}>Ordem</Label>
          <input
            id={`${id}-ordem`}
            name="ordem"
            value={ordem}
            onChange={(event) => setOrdem(event.target.value)}
            inputMode="numeric"
            required
            disabled={pendente}
            aria-invalid={erroOrdem ? true : undefined}
            aria-describedby={erroOrdem ? `${id}-erro-ordem` : undefined}
            className={estiloCampo}
          />
          {erroOrdem && (
            <p
              id={`${id}-erro-ordem`}
              role="alert"
              className="text-sm text-destructive"
            >
              {erroOrdem}
            </p>
          )}
        </div>
      )}
      <Button
        type="submit"
        variant={categoria ? "outline" : "default"}
        className="min-h-12 justify-self-start px-4"
        disabled={pendente}
      >
        {pendente ? "Salvando…" : rotuloBotao}
      </Button>
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
    </form>
  );
}

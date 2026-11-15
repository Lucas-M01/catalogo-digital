"use client";

import Link from "next/link";
import { type ChangeEvent, useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatarPreco } from "@/lib/whatsapp";
import type { EstadoForm, Produto } from "@/types";

type Campos = {
  produto_id: string;
  preco_promocional: string;
  inicio: string;
  fim: string;
};

const estiloCampo =
  "min-h-12 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-invalid:border-destructive";

export function FormPromocao({
  produtos,
  valores,
  promocaoId,
  action,
}: {
  produtos: Pick<Produto, "id" | "nome" | "preco">[] | null;
  valores: Campos;
  promocaoId?: string;
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
}) {
  const id = useId();
  const [estado, formAction, pendente] = useActionState(action, { ok: false });
  const [dados, setDados] = useState(valores);

  function campo(nome: keyof Campos) {
    const campoId = `${id}-${nome}`;
    return {
      id: campoId,
      name: nome,
      value: dados[nome],
      disabled: pendente,
      "aria-invalid": estado.erros?.[nome]?.[0] ? true : undefined,
      "aria-describedby": estado.erros?.[nome]?.[0]
        ? `${campoId}-erro`
        : undefined,
      onChange: (evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setDados({ ...dados, [nome]: evento.target.value }),
    };
  }

  function erroCampo(nome: keyof Campos) {
    const mensagem = estado.erros?.[nome]?.[0];
    return (
      mensagem && (
        <p
          id={`${id}-${nome}-erro`}
          role="alert"
          className="text-sm text-destructive"
        >
          {mensagem}
        </p>
      )
    );
  }

  if (produtos === null) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os produtos. Recarregue a página para tentar
        novamente.
      </p>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <p>Cadastre um produto para criar uma promoção.</p>
        <Button asChild className="min-h-12 px-4">
          <Link href="/admin/produtos/novo">Cadastrar produto</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      aria-busy={pendente}
      className="grid gap-4 rounded-xl border border-border bg-card p-4"
    >
      {promocaoId && <input type="hidden" name="id" value={promocaoId} />}
      <div className="min-w-0 space-y-2">
        <Label htmlFor={campo("produto_id").id}>Produto</Label>
        <select {...campo("produto_id")} required className={estiloCampo}>
          <option value="" disabled>
            Selecione um produto
          </option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome} · {formatarPreco(produto.preco)}
            </option>
          ))}
        </select>
        {erroCampo("produto_id")}
      </div>
      <div className="min-w-0 space-y-2">
        <Label htmlFor={campo("preco_promocional").id}>
          Preço promocional (R$)
        </Label>
        <input
          {...campo("preco_promocional")}
          required
          inputMode="decimal"
          placeholder="22,90"
          className={estiloCampo}
        />
        {erroCampo("preco_promocional")}
      </div>
      <fieldset aria-describedby={`${id}-fuso`} className="min-w-0 space-y-3">
        <legend className="sr-only">Período da promoção</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <Label htmlFor={campo("inicio").id}>Início</Label>
            <input
              {...campo("inicio")}
              type="datetime-local"
              step="any"
              required
              className={estiloCampo}
            />
            {erroCampo("inicio")}
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={campo("fim").id}>Fim (opcional)</Label>
            <input
              {...campo("fim")}
              type="datetime-local"
              step="any"
              className={estiloCampo}
            />
            {erroCampo("fim")}
          </div>
        </div>
        <p id={`${id}-fuso`} className="text-sm text-muted-foreground">
          Fuso: horário de Brasília
        </p>
      </fieldset>
      {estado.mensagem && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensagem}
        </p>
      )}
      <Button
        type="submit"
        className="min-h-12 w-full px-4 sm:w-fit"
        disabled={pendente}
      >
        {pendente
          ? "Salvando…"
          : promocaoId
            ? "Salvar promoção"
            : "Criar promoção"}
      </Button>
    </form>
  );
}

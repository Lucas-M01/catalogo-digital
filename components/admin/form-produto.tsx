"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type ReactNode,
  useActionState,
  useId,
  useState,
} from "react";
import { UploadImagem } from "@/components/admin/upload-imagem";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  Categoria,
  EstadoForm,
  ImagemProduto,
  ProdutoAdmin,
} from "@/types";

type Props = {
  action: (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;
  categorias: Pick<Categoria, "id" | "nome">[] | null;
  produto?: ProdutoAdmin;
};

const estiloCampo =
  "min-h-12 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-invalid:border-destructive";

function Campo({
  htmlFor,
  rotulo,
  erro,
  children,
}: {
  htmlFor: string;
  rotulo: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={htmlFor}>{rotulo}</Label>
      {children}
      {erro && (
        <p
          id={`${htmlFor}-erro`}
          role="alert"
          className="text-sm text-destructive"
        >
          {erro}
        </p>
      )}
    </div>
  );
}

export function FormProduto({ action, categorias, produto }: Props) {
  const id = useId();
  const [estado, formAction, pendente] = useActionState(action, { ok: false });
  const [imagemEscolhida, setImagemEscolhida] = useState<ImagemProduto | null>(
    null,
  );
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const imagem = imagemEscolhida ?? {
    imagem_url: produto?.imagem_url ?? null,
    imagem_path: produto?.imagem_path ?? null,
  };
  const [dados, setDados] = useState({
    nome: produto?.nome ?? "",
    descricao: produto?.descricao ?? "",
    preco: produto ? produto.preco.toFixed(2).replace(".", ",") : "",
    categoria_id: produto?.categoria.id ?? "",
    ordem: String(produto?.ordem ?? 0),
    disponivel: produto?.disponivel ?? true,
    destaque: produto?.destaque ?? false,
  });

  function campo(nome: keyof typeof dados) {
    const campoId = `${id}-${nome}`;
    const erro = estado.erros?.[nome]?.[0];
    return {
      id: campoId,
      name: nome,
      disabled: pendente,
      "aria-invalid": erro ? true : undefined,
      "aria-describedby": erro ? `${campoId}-erro` : undefined,
    };
  }

  function texto(
    nome: "nome" | "descricao" | "preco" | "categoria_id" | "ordem",
  ) {
    return {
      ...campo(nome),
      value: dados[nome],
      onChange: (
        evento: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => setDados({ ...dados, [nome]: evento.target.value }),
    };
  }

  if (categorias === null) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as categorias. Recarregue a página para tentar
        novamente.
      </p>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <p>Crie uma categoria para cadastrar um produto.</p>
        <Button asChild className="min-h-12 px-4">
          <Link href="/admin/categorias">Abrir categorias</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      aria-busy={pendente || enviandoImagem}
      className="grid gap-4 rounded-xl border border-border bg-card p-4"
    >
      {produto && <input type="hidden" name="id" value={produto.id} />}
      {produto && imagemEscolhida === null && (
        <input type="hidden" name="preservar_imagem" value="1" />
      )}
      <input type="hidden" name="imagem_url" value={imagem.imagem_url ?? ""} />
      <input
        type="hidden"
        name="imagem_path"
        value={imagem.imagem_path ?? ""}
      />
      <Campo
        htmlFor={campo("nome").id}
        rotulo="Nome"
        erro={estado.erros?.nome?.[0]}
      >
        <input
          {...texto("nome")}
          required
          maxLength={120}
          className={estiloCampo}
        />
      </Campo>
      <Campo
        htmlFor={campo("descricao").id}
        rotulo="Descrição (opcional)"
        erro={estado.erros?.descricao?.[0]}
      >
        <Textarea
          {...texto("descricao")}
          maxLength={1000}
          className={estiloCampo}
        />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          htmlFor={campo("preco").id}
          rotulo="Preço (R$)"
          erro={estado.erros?.preco?.[0]}
        >
          <input
            {...texto("preco")}
            required
            inputMode="decimal"
            placeholder="22,90"
            className={estiloCampo}
          />
        </Campo>
        <Campo
          htmlFor={campo("ordem").id}
          rotulo="Ordem"
          erro={estado.erros?.ordem?.[0]}
        >
          <input
            {...texto("ordem")}
            required
            inputMode="numeric"
            className={estiloCampo}
          />
        </Campo>
      </div>
      <Campo
        htmlFor={campo("categoria_id").id}
        rotulo="Categoria"
        erro={estado.erros?.categoria_id?.[0]}
      >
        <select {...texto("categoria_id")} required className={estiloCampo}>
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {categorias.map(({ id, nome }) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </select>
      </Campo>
      <div className="grid gap-x-4 sm:grid-cols-2">
        {(
          [
            ["disponivel", "Disponível no catálogo"],
            ["destaque", "Destacar produto"],
          ] as const
        ).map(([nome, rotulo]) => (
          <div key={nome} className="min-w-0">
            <Label htmlFor={campo(nome).id} className="min-h-12 cursor-pointer">
              <input
                {...campo(nome)}
                type="checkbox"
                checked={dados[nome]}
                onChange={(evento) =>
                  setDados({ ...dados, [nome]: evento.target.checked })
                }
                className="size-4 shrink-0 accent-primary"
              />
              {rotulo}
            </Label>
            {estado.erros?.[nome]?.[0] && (
              <p
                id={`${campo(nome).id}-erro`}
                role="alert"
                className="text-sm text-destructive"
              >
                {estado.erros[nome][0]}
              </p>
            )}
          </div>
        ))}
      </div>
      <UploadImagem
        imagem={imagem}
        onChange={setImagemEscolhida}
        onEnviando={setEnviandoImagem}
        enviando={enviandoImagem}
        disabled={pendente}
        erroFormulario={
          estado.erros?.imagem_url?.[0] ?? estado.erros?.imagem_path?.[0]
        }
      />
      <Button
        type="submit"
        className="min-h-12 w-full px-4 sm:w-fit"
        disabled={pendente || enviandoImagem}
      >
        {pendente ? "Salvando…" : produto ? "Salvar produto" : "Criar produto"}
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

"use client";

import Image from "next/image";
import { type ChangeEvent, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { enviarImagem } from "@/lib/admin/imagem";
import type { ImagemProduto } from "@/types";

type Props = {
  imagem: ImagemProduto;
  onChange: (imagem: ImagemProduto) => void;
  onEnviando: (enviando: boolean) => void;
  enviando: boolean;
  disabled: boolean;
  erroFormulario?: string;
};

export function UploadImagem({
  imagem,
  onChange,
  onEnviando,
  enviando,
  disabled,
  erroFormulario,
}: Props) {
  const arquivo = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const idErro = useId();
  const [erro, setErro] = useState<string | null>(null);
  const mensagem = erro ?? erroFormulario;
  const bloqueado = disabled || enviando;

  async function selecionar(evento: ChangeEvent<HTMLInputElement>) {
    const foto = evento.currentTarget.files?.[0];
    evento.currentTarget.value = "";
    if (!foto || bloqueado) return;

    setErro(null);
    onEnviando(true);
    try {
      onChange(await enviarImagem(foto));
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível enviar a imagem. Tente novamente.",
      );
    } finally {
      onEnviando(false);
    }
  }

  return (
    <fieldset className="min-w-0 space-y-3" aria-busy={enviando}>
      <legend className="text-sm font-medium">Imagem do produto</legend>
      {imagem.imagem_url && (
        <div className="relative aspect-square w-full max-w-64 overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={imagem.imagem_url}
            alt="Prévia da imagem do produto"
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={arquivo}
        onChange={selecionar}
        hidden
        disabled={bloqueado}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={camera}
        onChange={selecionar}
        hidden
        disabled={bloqueado}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-12 px-4"
          disabled={bloqueado}
          aria-invalid={Boolean(erroFormulario) || undefined}
          aria-describedby={mensagem ? idErro : undefined}
          onClick={() => arquivo.current?.click()}
        >
          Escolher imagem
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-12 px-4"
          disabled={bloqueado}
          onClick={() => camera.current?.click()}
        >
          Tirar foto
        </Button>
        {imagem.imagem_url && (
          <Button
            type="button"
            variant="destructive"
            className="min-h-12 px-4"
            disabled={bloqueado}
            onClick={() => {
              setErro(null);
              onChange({ imagem_url: null, imagem_path: null });
            }}
          >
            Remover imagem
          </Button>
        )}
      </div>
      {enviando && (
        <output className="text-sm text-muted-foreground">
          Preparando e enviando imagem…
        </output>
      )}
      {mensagem && (
        <p id={idErro} role="alert" className="text-sm text-destructive">
          {mensagem}
        </p>
      )}
    </fieldset>
  );
}

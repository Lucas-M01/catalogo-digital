"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Categoria } from "@/types";

type Props = {
  q: string;
  categoria: string;
  categorias: Categoria[];
  apenasPromocao: boolean;
  semResultados: boolean;
};

const classeControle =
  "min-h-12 w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring";

export function Filtros({
  q,
  categoria,
  categorias,
  apenasPromocao,
  semResultados,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [busca, setBusca] = useState(q);
  const [categoriaAtiva, setCategoriaAtiva] = useState(categoria);
  const [promocaoAtiva, setPromocaoAtiva] = useState(apenasPromocao);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    function sincronizarHistorico() {
      clearTimeout(temporizador.current);
      const params = new URLSearchParams(window.location.search);
      setBusca(params.get("q") ?? "");
      setCategoriaAtiva(params.get("categoria") ?? "");
      setPromocaoAtiva(params.get("promocao") === "1");
    }

    window.addEventListener("popstate", sincronizarHistorico);
    return () => {
      window.removeEventListener("popstate", sincronizarHistorico);
      clearTimeout(temporizador.current);
    };
  }, []);

  function atualizarUrl(termo: string, slug: string, promocao: boolean) {
    clearTimeout(temporizador.current);
    const params = new URLSearchParams();
    if (termo.trim()) params.set("q", termo.trim());
    if (slug) params.set("categoria", slug);
    if (promocao) params.set("promocao", "1");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function aplicarFormulario(formulario: HTMLFormElement) {
    const dados = new FormData(formulario);
    atualizarUrl(
      String(dados.get("q") ?? ""),
      String(dados.get("categoria") ?? ""),
      dados.get("promocao") === "1",
    );
  }

  return (
    <>
      <search>
        <form
          action={pathname}
          className="grid gap-4 md:grid-cols-[2fr_1fr]"
          onChange={(event) => {
            const formulario = event.currentTarget;
            clearTimeout(temporizador.current);
            if (
              event.target instanceof HTMLInputElement &&
              event.target.name === "q"
            ) {
              temporizador.current = setTimeout(
                () => aplicarFormulario(formulario),
                300,
              );
              return;
            }

            aplicarFormulario(formulario);
          }}
          onSubmit={(event) => {
            event.preventDefault();
            aplicarFormulario(event.currentTarget);
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            Produto
            <input
              className={classeControle}
              type="search"
              enterKeyHint="search"
              name="q"
              placeholder="Digite o nome de um produto"
              value={busca}
              onChange={(event) => setBusca(event.currentTarget.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Categoria
            <select
              className={classeControle}
              name="categoria"
              value={categoriaAtiva}
              onChange={(event) => setCategoriaAtiva(event.currentTarget.value)}
            >
              <option value="">Todas as categorias</option>
              {categoriaAtiva &&
                !categorias.some(({ slug }) => slug === categoriaAtiva) && (
                  <option value={categoriaAtiva}>Categoria indisponível</option>
                )}
              {categorias.map(({ id, nome, slug }) => (
                <option key={id} value={slug}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 text-sm font-medium md:col-span-2 md:w-fit">
            <input
              className="size-5 accent-primary focus-visible:outline-2 focus-visible:outline-ring"
              type="checkbox"
              name="promocao"
              value="1"
              checked={promocaoAtiva}
              onChange={(event) =>
                setPromocaoAtiva(event.currentTarget.checked)
              }
            />
            Apenas em promoção
          </label>
        </form>
      </search>
      {semResultados && (
        <div className="space-y-3 rounded-lg border p-4">
          <output className="block">
            Não encontramos produtos. Experimente outro termo ou ajuste os
            filtros.
          </output>
          <button
            className="min-h-12 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
            type="button"
            onClick={() => {
              setBusca("");
              setCategoriaAtiva("");
              setPromocaoAtiva(false);
              atualizarUrl("", "", false);
            }}
          >
            Limpar busca
          </button>
        </div>
      )}
    </>
  );
}

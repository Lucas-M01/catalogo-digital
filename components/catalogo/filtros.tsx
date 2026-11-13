"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Categoria } from "@/types";

type Props = {
  q: string;
  categoria: string;
  categorias: Categoria[];
  semResultados: boolean;
};

const classeControle =
  "min-h-12 w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring";

export function Filtros({ q, categoria, categorias, semResultados }: Props) {
  const router = useRouter();
  const [busca, setBusca] = useState(q);
  const [categoriaAtiva, setCategoriaAtiva] = useState(categoria);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    function sincronizarHistorico() {
      clearTimeout(temporizador.current);
      const params = new URLSearchParams(window.location.search);
      setBusca(params.get("q") ?? "");
      setCategoriaAtiva(params.get("categoria") ?? "");
    }

    window.addEventListener("popstate", sincronizarHistorico);
    return () => {
      window.removeEventListener("popstate", sincronizarHistorico);
      clearTimeout(temporizador.current);
    };
  }, []);

  function atualizarUrl(termo: string, slug: string) {
    clearTimeout(temporizador.current);
    const params = new URLSearchParams();
    if (termo.trim()) params.set("q", termo.trim());
    if (slug) params.set("categoria", slug);
    const query = params.toString();
    router.replace(query ? `/busca?${query}` : "/busca", { scroll: false });
  }

  return (
    <>
      <search>
        <form
          action="/busca"
          className="grid gap-4 md:grid-cols-[2fr_1fr]"
          onSubmit={(event) => {
            event.preventDefault();
            atualizarUrl(busca, categoriaAtiva);
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            Produto
            <input
              className={classeControle}
              type="search"
              name="q"
              placeholder="Digite o nome de um produto"
              value={busca}
              onChange={(event) => {
                const termo = event.target.value;
                setBusca(termo);
                clearTimeout(temporizador.current);
                temporizador.current = setTimeout(
                  () => atualizarUrl(termo, categoriaAtiva),
                  300,
                );
              }}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Categoria
            <select
              className={classeControle}
              name="categoria"
              value={categoriaAtiva}
              onChange={(event) => {
                const slug = event.target.value;
                setCategoriaAtiva(slug);
                atualizarUrl(busca, slug);
              }}
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
        </form>
      </search>
      {semResultados && (
        <div className="space-y-3 rounded-lg border p-4">
          <output className="block">
            Não encontramos produtos. Experimente outro termo ou categoria.
          </output>
          <button
            className="min-h-12 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
            type="button"
            onClick={() => {
              setBusca("");
              setCategoriaAtiva("");
              atualizarUrl("", "");
            }}
          >
            Limpar busca
          </button>
        </div>
      )}
    </>
  );
}

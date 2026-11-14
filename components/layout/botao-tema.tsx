"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chaveTema } from "@/lib/tema";

export function BotaoTema() {
  function alternarTema() {
    const raiz = document.documentElement;
    const tema = raiz.dataset.tema === "escuro" ? "claro" : "escuro";
    raiz.dataset.tema = tema;

    try {
      localStorage.setItem(chaveTema, tema);
    } catch {
      // A troca funciona na página mesmo com o armazenamento bloqueado.
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="min-h-12 min-w-12"
      title="Alternar tema"
      onClick={alternarTema}
    >
      <span className="hidden items-center dark:inline-flex">
        <Sun aria-hidden="true" className="size-5" />
        <span className="sr-only">Ativar tema claro</span>
      </span>
      <span className="inline-flex items-center dark:hidden">
        <Moon aria-hidden="true" className="size-5" />
        <span className="sr-only">Ativar tema escuro</span>
      </span>
    </Button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { EstadoForm } from "@/types";

export function useFocoErro(estado: EstadoForm, pendente: boolean) {
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok || pendente) return;
    const form = formulario.current;
    const campo = form?.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([type="hidden"]):not([disabled])',
    );
    (
      campo ?? form?.querySelector<HTMLElement>('[role="alert"][tabindex="-1"]')
    )?.focus();
  }, [estado, pendente]);

  return formulario;
}

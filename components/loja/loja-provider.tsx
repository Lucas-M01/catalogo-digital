"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { calcularStatusLoja } from "@/lib/loja-status";
import type { ConfigLoja, HorarioFuncionamento, StatusLoja } from "@/types";

const LojaContext = createContext<{
  status: StatusLoja | null;
  verificarStatus: (instante: Date) => StatusLoja;
} | null>(null);

export function LojaProvider({
  horarios,
  config,
  children,
}: {
  horarios: HorarioFuncionamento[];
  config: ConfigLoja;
  children: ReactNode;
}) {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    const atualizarRelogio = () => setAgora(new Date());
    const aoVoltar = () => {
      if (document.visibilityState === "visible") atualizarRelogio();
    };

    atualizarRelogio();
    const intervalo = window.setInterval(atualizarRelogio, 30_000);
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);

  const status =
    agora === null ? null : calcularStatusLoja(horarios, config, agora);

  function verificarStatus(instante: Date) {
    setAgora(instante);
    return calcularStatusLoja(horarios, config, instante);
  }

  return (
    <LojaContext value={{ status, verificarStatus }}>{children}</LojaContext>
  );
}

export function useLoja() {
  const loja = useContext(LojaContext);
  if (!loja) throw new Error("useLoja precisa estar dentro de LojaProvider.");
  return loja;
}

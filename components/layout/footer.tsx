import type { HorarioFuncionamento } from "@/types";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function agruparDias(horarios: HorarioFuncionamento[]) {
  const grupos: { inicio: number; fim: number; periodos: string }[] = [];
  for (const [indice] of dias.entries()) {
    const periodos =
      horarios
        .filter(({ dia_semana }) => dia_semana === (indice + 1) % dias.length)
        .map(({ abre, fecha }) => `${abre}–${fecha}`)
        .join(" e ") || "Fechado";
    const anterior = grupos.at(-1);
    if (anterior?.periodos === periodos) anterior.fim = indice;
    else grupos.push({ inicio: indice, fim: indice, periodos });
  }
  return grupos;
}

export function Footer({
  horarios,
}: {
  horarios: HorarioFuncionamento[] | null;
}) {
  return (
    <footer className="border-t">
      {horarios !== null && (
        <section
          aria-labelledby="horario-rodape"
          className="mx-auto max-w-6xl px-4 pt-6 text-sm md:px-6"
        >
          <h2 id="horario-rodape" className="mb-2 font-semibold">
            Horário de funcionamento
          </h2>
          <ul className="space-y-1 text-muted-foreground">
            {agruparDias(horarios).map(({ inicio, fim, periodos }) => (
              <li key={inicio}>
                {fim - inicio === dias.length - 1
                  ? "Todos os dias"
                  : inicio === fim
                    ? dias[inicio]
                    : `${dias[inicio]} a ${dias[fim]}`}
                {": "}
                {periodos}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mx-auto max-w-6xl px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-sm text-muted-foreground md:px-6">
        Cardápio Digital
      </p>
    </footer>
  );
}

import { FormConfigLoja } from "@/components/admin/form-config-loja";
import { FormHorarios } from "@/components/admin/form-horarios";
import { exigirAdmin } from "@/lib/admin/auth";
import { dataParaCampoBrasilia } from "@/lib/admin/datas";
import { lerDadosLojaAdmin } from "@/lib/admin/horarios";
import { calcularStatusLoja } from "@/lib/loja-status";
import { salvarConfiguracao, salvarHorarios } from "./actions";

export const metadata = { title: "Horário de funcionamento" };

export default async function PaginaHorarios() {
  const { supabase } = await exigirAdmin();
  const { horarios, config } = await lerDadosLojaAdmin(supabase);
  const agora = new Date();
  const status = config && calcularStatusLoja([], config, agora);
  const pausaAtiva = status?.aberta === false && status.motivo === "manual";
  const reabre = config?.reabre_em;
  const reabreNoFuturo = reabre && Date.parse(reabre) > agora.getTime();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Horário de funcionamento
      </h1>
      <section aria-labelledby="titulo-pausa" className="space-y-3">
        <h2 id="titulo-pausa" className="text-lg font-semibold">
          Fechar a loja agora
        </h2>
        {pausaAtiva && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Pausa manual ativa.</strong>{" "}
            {status.proximaAbertura
              ? `A pausa termina ${status.proximaAbertura}.`
              : "A loja está fechada por tempo indeterminado."}
          </p>
        )}
        {config ? (
          <FormConfigLoja
            action={salvarConfiguracao}
            valores={{
              secao: "pausa",
              ligado: pausaAtiva,
              reabre: reabreNoFuturo ? dataParaCampoBrasilia(reabre) : "",
              mensagem: config.mensagem_fechada ?? "",
            }}
          />
        ) : (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar a configuração. Recarregue a página para
            tentar novamente.
          </p>
        )}
      </section>

      <section aria-labelledby="titulo-semana" className="space-y-3">
        <h2 id="titulo-semana" className="text-lg font-semibold">
          Horário semanal
        </h2>
        {config && (
          <FormConfigLoja
            action={salvarConfiguracao}
            valores={{ secao: "grade", ligado: config.usar_horarios }}
          />
        )}
        {horarios ? (
          <FormHorarios action={salvarHorarios} horarios={horarios} />
        ) : (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar os horários. Recarregue a página para
            tentar novamente.
          </p>
        )}
      </section>
    </div>
  );
}

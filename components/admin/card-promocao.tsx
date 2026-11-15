import Link from "next/link";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { FormEncerrarPromocao } from "@/components/admin/form-encerrar-promocao";
import { Button } from "@/components/ui/button";
import { formatarDataBrasilia } from "@/lib/admin/datas";
import type { PromocaoAdmin } from "@/lib/admin/promocoes";
import { formatarPreco } from "@/lib/whatsapp";
import type { EstadoForm } from "@/types";

type Action = (estado: EstadoForm, dados: FormData) => Promise<EstadoForm>;

export function CardPromocao({
  promocao,
  encerrar,
  excluir,
}: {
  promocao: PromocaoAdmin;
  encerrar?: Action;
  excluir: Action;
}) {
  const { id, produto, inicio, fim } = promocao;
  const titulo = `promocao-${id}`;
  return (
    <article
      aria-labelledby={titulo}
      className="grid gap-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="min-w-0 space-y-1">
        <h3 id={titulo} className="wrap-anywhere font-semibold">
          {produto.nome}
        </h3>
        <p className="text-sm text-muted-foreground">
          Preço normal {formatarPreco(produto.preco)}
        </p>
        <p className="font-semibold text-primary-hover">
          {formatarPreco(promocao.preco_promocional)}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Início</dt>
          <dd>
            <time dateTime={inicio}>{formatarDataBrasilia(inicio)}</time>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Fim</dt>
          <dd>
            {fim ? (
              <time dateTime={fim}>{formatarDataBrasilia(fim)}</time>
            ) : (
              "Sem fim"
            )}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-start gap-2 border-border border-t pt-3">
        <Button asChild variant="outline" className="min-h-12 px-4">
          <Link href={`/admin/promocoes/${id}`}>Editar</Link>
        </Button>
        {encerrar && <FormEncerrarPromocao id={id} action={encerrar} />}
        <BotaoExcluir
          id={id}
          titulo={`Excluir promoção de “${produto.nome}”?`}
          descricao="A promoção será removida do catálogo. Esta ação é permanente."
          action={excluir}
        />
      </div>
    </article>
  );
}

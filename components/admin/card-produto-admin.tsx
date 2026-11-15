import Image from "next/image";
import Link from "next/link";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { InterruptorDisponibilidade } from "@/components/admin/interruptor-disponibilidade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calcularStatus } from "@/lib/admin/promocoes";
import { imagemProduto } from "@/lib/imagem-produto";
import { formatarPreco } from "@/lib/whatsapp";
import type { EstadoForm, ProdutoAdmin } from "@/types";

type ActionProduto = (
  estado: EstadoForm,
  dados: FormData,
) => Promise<EstadoForm>;

export function CardProdutoAdmin({
  produto,
  busca,
  alternarDisponivel,
  excluir,
}: {
  produto: ProdutoAdmin;
  busca: string;
  alternarDisponivel: ActionProduto;
  excluir: ActionProduto;
}) {
  const tituloId = `produto-admin-${produto.id}`;
  const temPromocaoAtiva = produto.promocoes.some(
    (promocao) =>
      promocao.preco_promocional < produto.preco &&
      calcularStatus(promocao) === "ativa",
  );

  return (
    <article
      aria-labelledby={tituloId}
      className="grid gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border">
          <Image
            {...imagemProduto(produto)}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2 id={tituloId} className="wrap-anywhere font-semibold">
            {produto.nome}
          </h2>
          <p className="wrap-anywhere text-sm text-muted-foreground">
            {produto.categoria.nome}
          </p>
          <p className="font-semibold tabular-nums">
            {formatarPreco(produto.preco)}
          </p>
          <div className="flex flex-wrap gap-1">
            {!produto.disponivel && <Badge variant="outline">Oculto</Badge>}
            {temPromocaoAtiva && (
              <Badge variant="outline">Promoção ativa</Badge>
            )}
          </div>
        </div>
      </div>
      <InterruptorDisponibilidade
        id={produto.id}
        disponivel={produto.disponivel}
        action={alternarDisponivel}
      />
      <div className="flex flex-wrap items-center gap-2 border-border border-t pt-3">
        <Button asChild variant="outline" className="min-h-12 px-4">
          <Link href={`/admin/produtos/${produto.id}`}>Editar</Link>
        </Button>
        <BotaoExcluir
          id={produto.id}
          busca={busca}
          titulo={`Excluir “${produto.nome}”?`}
          descricao="O produto será removido do catálogo. Esta ação é permanente."
          action={excluir}
        />
      </div>
    </article>
  );
}

import { Badge } from "@/components/ui/badge";
import { formatarPreco } from "@/lib/whatsapp";
import type { Produto } from "@/types";

type Props = Pick<Produto, "preco" | "preco_promocional">;

export function PrecoProduto({ preco, preco_promocional }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {preco_promocional !== null && (
        <del className="text-sm text-muted-foreground">
          <span className="sr-only">Preço original </span>
          {formatarPreco(preco)}
        </del>
      )}
      <span className="font-semibold">
        {formatarPreco(preco_promocional ?? preco)}
      </span>
      {preco_promocional !== null && <Badge>Promoção</Badge>}
    </div>
  );
}

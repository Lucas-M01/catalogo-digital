import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatarPreco } from "@/lib/whatsapp";
import type { Produto } from "@/types";

type Props = Pick<Produto, "preco" | "preco_promocional"> & {
  className?: string;
};

export function PrecoProduto({ preco, preco_promocional, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-lg",
        className,
      )}
    >
      {preco_promocional !== null && (
        <del className="text-sm text-muted-foreground">
          <span className="sr-only">Preço original </span>
          {formatarPreco(preco)}
        </del>
      )}
      <span className="font-bold tracking-tight text-primary-hover">
        {formatarPreco(preco_promocional ?? preco)}
      </span>
      {preco_promocional !== null && (
        <Badge
          variant="outline"
          className="rounded-sm bg-accent text-[10px] font-bold uppercase text-primary-hover"
        >
          Promoção
        </Badge>
      )}
    </div>
  );
}

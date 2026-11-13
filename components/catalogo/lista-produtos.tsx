import { CardProduto } from "@/components/catalogo/card-produto";
import type { Produto } from "@/types";

type Props = { produtos: Produto[] };

export function ListaProdutos({ produtos }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {produtos.map((produto) => (
        <li key={produto.id}>
          <CardProduto produto={produto} />
        </li>
      ))}
    </ul>
  );
}

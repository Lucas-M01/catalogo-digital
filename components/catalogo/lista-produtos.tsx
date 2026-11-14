import { CardProduto } from "@/components/catalogo/card-produto";
import type { Produto } from "@/types";

type Props = { produtos: Produto[]; imagensPrioritarias?: readonly string[] };

export function ListaProdutos({
  produtos,
  imagensPrioritarias = produtos.slice(0, 4).map(({ id }) => id),
}: Props) {
  return (
    <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {produtos.map((produto) => (
        <li key={produto.id}>
          <CardProduto
            produto={produto}
            preload={imagensPrioritarias.includes(produto.id)}
          />
        </li>
      ))}
    </ul>
  );
}

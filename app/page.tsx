import Link from "next/link";
import { ListaProdutos } from "@/components/catalogo/lista-produtos";
import { getProdutos } from "@/lib/produtos";

export default async function HomePage() {
  const produtos = await getProdutos();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold uppercase tracking-tight">Cardápio</h1>
        <Link
          href="/busca"
          className="inline-flex min-h-12 items-center rounded-lg border px-4 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          Buscar produtos
        </Link>
      </div>
      <ListaProdutos produtos={produtos} />
    </div>
  );
}

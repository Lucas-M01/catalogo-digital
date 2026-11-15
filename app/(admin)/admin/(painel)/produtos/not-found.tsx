import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProdutoNaoEncontrado() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Produto não encontrado
      </h1>
      <Button asChild variant="outline" className="min-h-12 px-4">
        <Link href="/admin/produtos">Voltar aos produtos</Link>
      </Button>
    </div>
  );
}

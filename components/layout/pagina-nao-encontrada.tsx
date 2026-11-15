import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaginaNaoEncontrada() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center md:py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="text-muted-foreground">
        Este endereço não está disponível. Você pode voltar ao catálogo para
        explorar os produtos.
      </p>
      <Button asChild className="min-h-12 w-full px-5 md:w-auto">
        <Link href="/">Voltar ao catálogo</Link>
      </Button>
    </div>
  );
}

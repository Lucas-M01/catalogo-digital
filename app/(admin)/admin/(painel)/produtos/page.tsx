import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Produtos" };

export default async function PaginaProdutos() {
  await exigirAdmin();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
      <p className="text-muted-foreground">
        O gerenciamento de produtos estará disponível em uma próxima fase.
      </p>
    </div>
  );
}

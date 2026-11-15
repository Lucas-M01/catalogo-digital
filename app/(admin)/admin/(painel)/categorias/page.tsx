import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Categorias" };

export default async function PaginaCategorias() {
  await exigirAdmin();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
      <p className="text-muted-foreground">
        O gerenciamento de categorias estará disponível em uma próxima fase.
      </p>
    </div>
  );
}

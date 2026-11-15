import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Promoções" };

export default async function PaginaPromocoes() {
  await exigirAdmin();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Promoções</h1>
      <p className="text-muted-foreground">
        O gerenciamento de promoções estará disponível em uma próxima fase.
      </p>
    </div>
  );
}

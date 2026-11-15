import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function contarProdutos(supabase: SupabaseClient) {
  const [total, ocultos] = await Promise.all([
    supabase.from("produtos").select("id", { count: "exact", head: true }),
    supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("disponivel", false),
  ]);

  return {
    total: total.count,
    ocultos: ocultos.count,
  };
}

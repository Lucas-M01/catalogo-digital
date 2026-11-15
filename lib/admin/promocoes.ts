import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function contarPromocoesAtivas(supabase: SupabaseClient) {
  const agora = new Date().toISOString();
  const { count } = await supabase
    .from("promocoes")
    .select("id", { count: "exact", head: true })
    .lte("inicio", agora)
    .or(`fim.is.null,fim.gt.${agora}`);

  return count;
}

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import slugify from "slugify";

export async function gerarSlugDisponivel(
  supabase: SupabaseClient,
  tabela: "categorias" | "produtos",
  nome: string,
) {
  const base = slugify(nome, { lower: true, strict: true }) || "item";

  for (let numero = 1; ; numero++) {
    const slug = numero === 1 ? base : `${base}-${numero}`;
    const { data, error } = await supabase
      .from(tabela)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return null;
    if (!data) return slug;
  }
}

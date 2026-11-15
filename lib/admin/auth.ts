import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const exigirAdmin = cache(async () => {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/admin/login");

  return { supabase, user: data.user };
});

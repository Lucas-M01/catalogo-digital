"use server";

import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin/auth";
import type { EstadoForm } from "@/types";

export async function sair(): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    return { ok: false, mensagem: "Não foi possível sair. Tente novamente." };
  }

  redirect("/admin/login");
}

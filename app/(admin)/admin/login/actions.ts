"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { EstadoForm } from "@/types";

const schema = z.object({
  email: z.string().trim().pipe(z.email()),
  senha: z.string().min(1),
});

const credenciaisInvalidas: EstadoForm = {
  ok: false,
  mensagem: "E-mail ou senha incorretos",
};

export async function entrar(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const dados = schema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!dados.success) return credenciaisInvalidas;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error) return credenciaisInvalidas;

  redirect("/admin");
}

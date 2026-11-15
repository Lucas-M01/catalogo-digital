"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { EstadoForm } from "@/types";

const mensagem = "E-mail ou senha incorretos";
const schema = z.object({
  email: z.string(mensagem).trim().pipe(z.email(mensagem)),
  senha: z.string(mensagem).min(1, mensagem),
});

const credenciaisInvalidas: EstadoForm = {
  ok: false,
  mensagem,
};

export async function entrar(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const dados = schema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!dados.success)
    return {
      ...credenciaisInvalidas,
      erros: z.flattenError(dados.error).fieldErrors,
    };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error)
    return {
      ...credenciaisInvalidas,
      erros: { email: [mensagem], senha: [mensagem] },
    };

  redirect("/admin?resultado=sessao-iniciada");
}

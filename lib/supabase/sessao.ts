import "server-only";

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { lerEnvSupabase } from "@/lib/env";

export async function atualizarSessao(request: NextRequest) {
  const env = lerEnvSupabase();
  const cabecalhosAuth = new Headers({ "Cache-Control": "private, no-store" });
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista, cabecalhos) => {
          for (const { name, value } of lista) {
            request.cookies.set(name, value);
          }

          const atualizada = NextResponse.next({ request });
          for (const cookie of resposta.cookies.getAll()) {
            atualizada.cookies.set(cookie);
          }
          for (const { name, value, options } of lista) {
            atualizada.cookies.set(name, value, options);
          }

          resposta = atualizada;
          for (const [nome, valor] of Object.entries(cabecalhos)) {
            cabecalhosAuth.set(nome, valor);
          }
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  const temSessao = !error && Boolean(data.user);
  const naPaginaLogin = request.nextUrl.pathname === "/admin/login";

  let destino: string | undefined;
  if (!temSessao && !naPaginaLogin) destino = "/admin/login";
  if (temSessao && naPaginaLogin) destino = "/admin";

  if (destino) {
    const redirecionamento = NextResponse.redirect(
      new URL(destino, request.url),
      request.method === "POST" ? 303 : 307,
    );
    for (const cookie of resposta.cookies.getAll()) {
      redirecionamento.cookies.set(cookie);
    }
    resposta = redirecionamento;
  }

  cabecalhosAuth.forEach((valor, nome) => {
    resposta.headers.set(nome, valor);
  });
  return resposta;
}

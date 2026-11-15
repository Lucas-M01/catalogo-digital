import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/sessao";

export function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = { matcher: ["/admin/:path*"] };

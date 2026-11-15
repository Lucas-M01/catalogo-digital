import { createBrowserClient } from "@supabase/ssr";
import { lerEnvSupabase } from "@/lib/env";

export function criarClienteNavegador() {
  const env = lerEnvSupabase();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

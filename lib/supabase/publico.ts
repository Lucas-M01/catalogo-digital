import { createClient } from "@supabase/supabase-js";
import { lerEnvSupabase } from "@/lib/env";

const env = lerEnvSupabase();

export const supabasePublico = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

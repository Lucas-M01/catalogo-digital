import { supabasePublico } from "@/lib/supabase/publico";

export async function GET() {
  const { error } = await supabasePublico
    .from("produtos")
    .select("id")
    .limit(1);

  return Response.json({ ok: !error }, { status: error ? 503 : 200 });
}

import { NextResponse } from "next/server";

export async function GET() {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const aiProvider = process.env.LLM_PROVIDER ?? "nvidia";

  return NextResponse.json({
    ok: true,
    app: "mcat-companion",
    db: hasSupabase ? "configured" : "missing-env",
    ai_provider: aiProvider,
  });
}

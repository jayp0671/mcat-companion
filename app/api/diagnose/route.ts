import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { diagnoseMistakesWithFallback } from "@/lib/ai/retry";
import { getAiProviderMetadata } from "@/lib/ai/metadata";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const aiMetadata = getAiProviderMetadata();
  const startedAt = Date.now();

  const { data: mistakes } = await supabase
    .from("mistake_log_entries")
    .select(`id, logged_at, her_selected_answer, correct_answer, notes, question:questions(id, stem, section, difficulty, topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code))`)
    .eq("user_id", user.id)
    .gte("logged_at", start.toISOString())
    .order("logged_at", { ascending: false })
    .limit(100);

  const summary = await loadDashboardSummary(supabase, user.id);

  try {
    const report = await diagnoseMistakesWithFallback({ mistakes: mistakes ?? [], masteryState: summary });

    const { data, error } = await supabase
      .from("diagnosis_reports")
      .insert({
        user_id: user.id,
        period_start: start.toISOString().slice(0, 10),
        period_end: end.toISOString().slice(0, 10),
        patterns: report.patterns,
        summary: report.summary,
      })
      .select("*")
      .single();

    await supabase.from("ai_generations").insert({
      kind: "diagnosis",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "mistake_diagnosis-1.0.0",
      input: { mistake_count: mistakes?.length ?? 0, period_start: start.toISOString(), period_end: end.toISOString() },
      output: report,
      latency_ms: Date.now() - startedAt,
      status: error ? "error" : "success",
      error_message: error?.message ?? null,
      linked_entity_id: data?.id ?? null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ report: data });
  } catch (err) {
    await supabase.from("ai_generations").insert({
      kind: "diagnosis",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "mistake_diagnosis-1.0.0",
      input: { mistake_count: mistakes?.length ?? 0, period_start: start.toISOString(), period_end: end.toISOString() },
      output: null,
      latency_ms: Date.now() - startedAt,
      status: "error",
      error_message: err instanceof Error ? err.message : "Unknown diagnosis error",
    });

    return NextResponse.json({ error: "Could not generate diagnosis right now." }, { status: 502 });
  }
}

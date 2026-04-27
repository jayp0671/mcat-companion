import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";
import { buildWeeklyPlan } from "@/lib/services/planner";
import { generatePlanNarrativeWithFallback } from "@/lib/ai/retry";
import { getAiProviderMetadata } from "@/lib/ai/metadata";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const aiMetadata = getAiProviderMetadata();
  const startedAt = Date.now();
  const { data: profile } = await supabase.from("profiles").select("hours_per_week, target_test_date").eq("id", user.id).maybeSingle();
  const summary = await loadDashboardSummary(supabase, user.id);
  const blocks = buildWeeklyPlan({ hoursPerWeek: profile?.hours_per_week ?? 15, examDate: profile?.target_test_date, weakTopics: summary.weakTopics });

  try {
    const narrative = await generatePlanNarrativeWithFallback({ blocks, weeklyHours: profile?.hours_per_week ?? 15, examDate: profile?.target_test_date ?? undefined });
    const validFrom = blocks[0]?.date ?? new Date().toISOString().slice(0, 10);
    const validUntil = blocks[blocks.length - 1]?.date ?? validFrom;

    await supabase.from("study_plans").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
    const { data, error } = await supabase
      .from("study_plans")
      .insert({
        user_id: user.id,
        valid_from: validFrom,
        valid_until: validUntil,
        params: { hours_per_week: profile?.hours_per_week ?? 15, target_test_date: profile?.target_test_date ?? null },
        plan_data: { narrative: narrative.narrative, blocks: narrative.blocks ?? blocks },
        is_active: true,
      })
      .select("*")
      .single();

    await supabase.from("ai_generations").insert({
      kind: "plan",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "study_plan-1.0.0",
      input: { block_count: blocks.length, hours_per_week: profile?.hours_per_week ?? 15, target_test_date: profile?.target_test_date ?? null },
      output: narrative,
      latency_ms: Date.now() - startedAt,
      status: error ? "error" : "success",
      error_message: error?.message ?? null,
      linked_entity_id: data?.id ?? null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan: data });
  } catch (err) {
    await supabase.from("ai_generations").insert({
      kind: "plan",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "study_plan-1.0.0",
      input: { block_count: blocks.length, hours_per_week: profile?.hours_per_week ?? 15, target_test_date: profile?.target_test_date ?? null },
      output: null,
      latency_ms: Date.now() - startedAt,
      status: "error",
      error_message: err instanceof Error ? err.message : "Unknown plan generation error",
    });

    return NextResponse.json({ error: "Could not generate study plan right now." }, { status: 502 });
  }
}

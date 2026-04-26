import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";
import { buildWeeklyPlan } from "@/lib/services/planner";
import { generatePlanNarrativeWithFallback } from "@/lib/ai/retry";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("hours_per_week, target_test_date").eq("id", user.id).maybeSingle();
  const summary = await loadDashboardSummary(supabase, user.id);
  const blocks = buildWeeklyPlan({ hoursPerWeek: profile?.hours_per_week ?? 15, examDate: profile?.target_test_date, weakTopics: summary.weakTopics });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { diagnoseMistakesWithFallback } from "@/lib/ai/retry";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const { data: mistakes } = await supabase
    .from("mistake_log_entries")
    .select(`id, logged_at, her_selected_answer, correct_answer, notes, question:questions(id, stem, section, difficulty, topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code))`)
    .eq("user_id", user.id)
    .gte("logged_at", start.toISOString())
    .order("logged_at", { ascending: false })
    .limit(100);

  const summary = await loadDashboardSummary(supabase, user.id);
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data });
}

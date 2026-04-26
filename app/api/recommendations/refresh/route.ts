import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const summary = await loadDashboardSummary(supabase, user.id);
  const items = summary.weakTopics.map((topic) => ({
    topic_id: topic.id,
    title: topic.name,
    action: `Review ${topic.name}, then complete a short targeted practice block.`,
    evidence: `${topic.misses} logged misses`,
    priority: topic.misses,
  }));

  const { data, error } = await supabase
    .from("recommendations")
    .insert({ user_id: user.id, items, rationale: summary.todayRecommendation })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendation: data });
}

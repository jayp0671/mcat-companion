import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: saved } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (saved) return NextResponse.json({ recommendation: saved });

  const summary = await loadDashboardSummary(supabase, user.id);
  return NextResponse.json({
    recommendation: {
      items: summary.weakTopics.map((topic) => ({
        topic_id: topic.id,
        title: topic.name,
        action: `Review ${topic.name} and do 5-10 targeted questions.`,
        priority: topic.misses,
      })),
      rationale: summary.todayRecommendation,
      generated_at: new Date().toISOString(),
    },
  });
}

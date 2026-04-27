import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRulesEngineMetadata } from "@/lib/ai/metadata";
import { loadDashboardSummary } from "@/lib/services/dashboard-data";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startedAt = Date.now();
  const metadata = getRulesEngineMetadata();
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

  await supabase.from("ai_generations").insert({
    kind: "recommendation",
    provider: metadata.provider,
    model: metadata.model,
    prompt_version: "recommendation-rules-1.0.0",
    input: { weak_topic_count: summary.weakTopics.length },
    output: { items, rationale: summary.todayRecommendation },
    latency_ms: Date.now() - startedAt,
    status: error ? "error" : "success",
    error_message: error?.message ?? null,
    linked_entity_id: data?.id ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendation: data });
}

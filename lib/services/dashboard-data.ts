import { buildDashboardSummary } from "@/lib/services/dashboard";
import { normalizeMistakeRows } from "@/lib/mistakes/normalize";

export async function loadDashboardSummary(supabase: any, userId: string) {
  const { data } = await supabase
    .from("mistake_log_entries")
    .select(`
      id,
      her_selected_answer,
      correct_answer,
      her_confidence,
      time_spent_seconds,
      notes,
      logged_at,
      question:questions(
        id,
        stem,
        passage,
        format,
        section,
        source_material,
        difficulty,
        content_category_id,
        topic_id,
        subtopic_id,
        topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code),
        category:taxonomy_nodes!questions_content_category_id_fkey(id, name, code)
      )
    `)
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(500);

  const normalized = normalizeMistakeRows(data ?? []) as unknown as Parameters<typeof buildDashboardSummary>[0];
  return buildDashboardSummary(normalized);
}

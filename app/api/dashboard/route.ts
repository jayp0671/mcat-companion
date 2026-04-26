import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeDashboardMistakeRows } from "@/lib/mistakes/normalize";
import { buildDashboardSummary } from "@/lib/services/dashboard";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("mistake_log_entries")
    .select(
      `
      id,
      her_selected_answer,
      correct_answer,
      her_confidence,
      time_spent_seconds,
      notes,
      logged_at,
      question:questions (
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
        topic:taxonomy_nodes!questions_topic_id_fkey (
          id,
          name,
          code
        ),
        category:taxonomy_nodes!questions_content_category_id_fkey (
          id,
          name,
          code
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(250);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard", details: error.message },
      { status: 500 },
    );
  }

  const rows = normalizeDashboardMistakeRows(data ?? []);
  const summary = buildDashboardSummary(rows);

  return NextResponse.json(summary);
}

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateMistakeSchema } from "@/lib/mistakes/validators";
import { normalizeMistakeListItem } from "@/lib/mistakes/normalize";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
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
        content_category:taxonomy_nodes!questions_content_category_id_fkey(id, name, code),
        topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code),
        subtopic:taxonomy_nodes!questions_subtopic_id_fkey(id, name, code),
        choices:question_choices(id, label, text, is_correct, position),
        skills:question_skills(skill:reasoning_skills(id, code, name))
      )
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ mistake: normalizeMistakeListItem(data) });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = updateMistakeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("mistake_log_entries")
    .update(parsed.data)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mistake: normalizeMistakeListItem(data) });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: entry, error: lookupError } = await supabase
    .from("mistake_log_entries")
    .select("id, question_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (lookupError || !entry) {
    return NextResponse.json({ error: "Mistake not found." }, { status: 404 });
  }

  const { error: deleteLogError } = await supabase
    .from("mistake_log_entries")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (deleteLogError) {
    return NextResponse.json({ error: deleteLogError.message }, { status: 500 });
  }

  await supabase
    .from("questions")
    .delete()
    .eq("id", entry.question_id)
    .eq("created_by", user.id);

  return NextResponse.json({ ok: true });
}

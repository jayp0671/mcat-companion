import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();

  const { data: choice, error: choiceError } = await supabase
    .from("question_choices")
    .select("id, question_id, label, is_correct")
    .eq("id", body.choice_id)
    .single();
  if (choiceError || !choice) return NextResponse.json({ error: "Choice not found" }, { status: 404 });

  const { data: answer, error } = await supabase
    .from("student_answers")
    .insert({
      user_id: user.id,
      session_id: body.session_id ?? null,
      question_id: choice.question_id,
      selected_choice_id: choice.id,
      selected_label: choice.label,
      is_correct: choice.is_correct,
      time_spent_ms: body.time_ms ?? null,
      confidence: body.confidence ?? null,
      flagged_for_review: Boolean(body.flagged_for_review),
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.session_id) {
    const { data: counts } = await supabase.from("student_answers").select("is_correct").eq("session_id", body.session_id).eq("user_id", user.id);
    await supabase.from("practice_sessions").update({ correct_count: (counts ?? []).filter((row) => row.is_correct).length }).eq("id", body.session_id).eq("user_id", user.id);
  }

  return NextResponse.json({ answer, is_correct: choice.is_correct, correct_choice_id: choice.is_correct ? choice.id : null });
}

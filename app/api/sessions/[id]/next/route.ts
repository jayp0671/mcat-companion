import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: answered } = await supabase.from("student_answers").select("question_id").eq("session_id", params.id).eq("user_id", user.id);
  const answeredIds = new Set((answered ?? []).map((row) => row.question_id));

  const { data, error } = await supabase
    .from("session_questions")
    .select(`id, position, question:questions(id, stem, passage, section, format, difficulty, source_material, choices:question_choices(id, label, text, is_correct, position))`)
    .eq("session_id", params.id)
    .order("position", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const next = (data ?? []).map((row: any) => ({ ...row, question: Array.isArray(row.question) ? row.question[0] : row.question })).find((row: any) => row.question && !answeredIds.has(row.question.id));
  if (!next) return NextResponse.json({ done: true });

  await supabase.from("session_questions").update({ served_at: new Date().toISOString() }).eq("id", next.id);
  return NextResponse.json({ done: false, item: next });
}

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const mode = ["topic", "weakness", "mixed", "diagnostic"].includes(body.mode) ? body.mode : "mixed";
  const count = Math.max(1, Math.min(Number(body.count ?? 10), 25));

  let query = supabase
    .from("questions")
    .select("id")
    .eq("review_status", "approved")
    .in("source_type", ["ai_generated", "hand_written"])
    .limit(count);

  if (body.topic_id) query = query.eq("topic_id", body.topic_id);
  if (body.section) query = query.eq("section", body.section);

  const { data: questions, error: qError } = await query;
  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 });
  if (!questions?.length) {
    return NextResponse.json({ error: "No approved practice questions found yet. Generate and approve questions in Admin first." }, { status: 404 });
  }

  const { data: session, error } = await supabase
    .from("practice_sessions")
    .insert({ user_id: user.id, mode, params: body, total_questions: questions.length })
    .select("*")
    .single();
  if (error || !session) return NextResponse.json({ error: error?.message ?? "Could not create session" }, { status: 500 });

  const rows = questions.map((question, index) => ({ session_id: session.id, question_id: question.id, position: index + 1 }));
  const { error: sqError } = await supabase.from("session_questions").insert(rows);
  if (sqError) return NextResponse.json({ error: sqError.message }, { status: 500 });

  return NextResponse.json({ session });
}

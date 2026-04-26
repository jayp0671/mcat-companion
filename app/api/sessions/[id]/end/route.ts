import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: { id: string } };
export async function POST(_request: Request, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: answers } = await supabase.from("student_answers").select("is_correct").eq("session_id", params.id).eq("user_id", user.id);
  const correct = (answers ?? []).filter((row) => row.is_correct).length;
  const { data, error } = await supabase.from("practice_sessions").update({ ended_at: new Date().toISOString(), correct_count: correct }).eq("id", params.id).eq("user_id", user.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

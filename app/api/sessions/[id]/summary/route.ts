import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: { id: string } };
export async function GET(_request: Request, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: session, error } = await supabase.from("practice_sessions").select("*").eq("id", params.id).eq("user_id", user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  const { data: answers } = await supabase.from("student_answers").select("*").eq("session_id", params.id).eq("user_id", user.id).order("answered_at", { ascending: true });
  return NextResponse.json({ session, answers: answers ?? [] });
}

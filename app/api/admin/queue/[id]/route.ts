import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: { id: string } };
async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase, user.id))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const review_status = body.review_status;
  if (!["pending", "approved", "rejected"].includes(review_status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { data, error } = await supabase.from("questions").update({ review_status }).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ question: data });
}

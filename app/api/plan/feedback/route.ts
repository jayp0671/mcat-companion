import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { plan_id, block_id, completed } = await request.json();

  const { data: plan, error } = await supabase.from("study_plans").select("*").eq("id", plan_id).eq("user_id", user.id).single();
  if (error || !plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const blocks = Array.isArray(plan.plan_data?.blocks) ? plan.plan_data.blocks : [];
  const nextBlocks = blocks.map((block: any) => block.id === block_id ? { ...block, completed: Boolean(completed) } : block);
  const nextData = { ...plan.plan_data, blocks: nextBlocks };
  const { data, error: updateError } = await supabase.from("study_plans").update({ plan_data: nextData }).eq("id", plan.id).select("*").single();
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}

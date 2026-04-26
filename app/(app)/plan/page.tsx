import { redirect } from "next/navigation";
import { WeeklyView } from "@/components/plan/WeeklyView";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlanPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: plan } = await supabase.from("study_plans").select("*").eq("user_id", user.id).eq("is_active", true).order("generated_at", { ascending: false }).limit(1).maybeSingle();
  return <div className="space-y-4"><h1 className="text-3xl font-bold">Study plan</h1><WeeklyView plan={plan} /></div>;
}

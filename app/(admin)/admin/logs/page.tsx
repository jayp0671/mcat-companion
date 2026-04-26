import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogTable } from "@/components/admin/LogTable";
export default async function AdminLogsPage(){const supabase=createSupabaseServerClient(); const {data:logs}=await supabase.from("ai_generations").select("*").order("created_at",{ascending:false}).limit(100); return <div className="space-y-4"><h1 className="text-3xl font-bold">AI generation logs</h1><LogTable logs={logs??[]} /></div>}

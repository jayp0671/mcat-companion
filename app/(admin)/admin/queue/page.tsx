import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReviewCard } from "@/components/admin/ReviewCard";

export default async function AdminQueuePage(){
 const supabase=createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/login");
 const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(profile?.role!=="admin") return <div className="rounded-2xl border bg-white p-5">Admin role required.</div>;
 const {data:queue}=await supabase.from("questions").select("id, stem, section, review_status, choices:question_choices(id,label,text,is_correct,position)").eq("source_type","ai_generated").order("created_at",{ascending:false}).limit(100);
 return <div className="space-y-4"><h1 className="text-3xl font-bold">Review queue</h1><div className="grid gap-4">{(queue??[]).map((q:any)=><ReviewCard key={q.id} question={q}/>)}</div></div>;
}

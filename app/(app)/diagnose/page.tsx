import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DiagnosisControls } from "@/components/diagnose/DiagnosisControls";

export default async function DiagnosePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: reports } = await supabase.from("diagnosis_reports").select("*").eq("user_id", user.id).order("generated_at", { ascending: false }).limit(10);

  return (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-bold">Mistake pattern diagnosis</h1><p className="mt-2 text-sm text-slate-500">AI summarizes recurring patterns from the last 30 days of logged mistakes.</p></div>
      <DiagnosisControls />
      <div className="space-y-4">
        {(reports ?? []).map((report: any) => (
          <Card key={report.id}>
            <CardTitle>{new Date(report.generated_at).toLocaleDateString()} report</CardTitle>
            <CardContent className="mt-2 space-y-3">
              <p>{report.summary}</p>
              {Array.isArray(report.patterns) && report.patterns.length ? (
                <ul className="space-y-2">
                  {report.patterns.map((pattern: any, index: number) => <li key={index} className="rounded-xl bg-slate-50 p-3"><strong>{pattern.name}</strong>: {pattern.recommendation}</li>)}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

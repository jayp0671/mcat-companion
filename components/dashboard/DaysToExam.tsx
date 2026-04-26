import { Card, CardContent, CardTitle } from "@/components/ui/card";

type DaysToExamProps = {
  days?: number | null;
  targetDate?: string | null;
};

export function DaysToExam({ days = null, targetDate = null }: DaysToExamProps) {
  return (
    <Card>
      <CardTitle>Days until exam</CardTitle>
      <CardContent className="mt-4">
        <p className="text-4xl font-bold text-slate-950">{days ?? "—"}</p>
        <p className="mt-2 text-sm text-slate-500">
          {targetDate ? `Target date: ${targetDate}` : "Set a target test date during onboarding."}
        </p>
      </CardContent>
    </Card>
  );
}

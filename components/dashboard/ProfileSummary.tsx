import { Card, CardContent, CardTitle } from "@/components/ui/card";

type ProfileSummaryProps = {
  displayName: string | null;
  targetScore: number | null;
  hoursPerWeek: number | null;
};

export function ProfileSummary({ displayName, targetScore, hoursPerWeek }: ProfileSummaryProps) {
  return (
    <Card>
      <CardTitle>Prep profile</CardTitle>
      <CardContent className="mt-4 space-y-2 text-sm text-slate-600">
        <p><span className="font-medium text-slate-950">Student:</span> {displayName ?? "Not set"}</p>
        <p><span className="font-medium text-slate-950">Target score:</span> {targetScore ?? "Not set"}</p>
        <p><span className="font-medium text-slate-950">Weekly hours:</span> {hoursPerWeek ?? "Not set"}</p>
      </CardContent>
    </Card>
  );
}

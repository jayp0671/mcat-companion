import { Card, CardContent, CardTitle } from "@/components/ui/card";
export function ReadinessGauge({ value }: { value: number }) {
  return <Card><CardTitle>Readiness indicator</CardTitle><CardContent><p className="mt-2 text-4xl font-bold text-slate-900">{value}</p><p className="mt-1">Directional only. Not a score predictor.</p></CardContent></Card>;
}

import { Card, CardContent, CardTitle } from "@/components/ui/card";
const rows = ["Chem/Phys", "CARS", "Bio/Biochem", "Psych/Soc"];
export function MasteryBar() { return <Card><CardTitle>Section mastery</CardTitle><CardContent className="space-y-3">{rows.map((r, i) => <div key={r}><div className="mb-1 flex justify-between"><span>{r}</span><span>{35 + i * 8}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${35 + i * 8}%` }} /></div></div>)}</CardContent></Card>; }

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ExplainButton } from "./ExplainButton";
export function MistakeDetail({ id }: { id: string }) { return <div className="space-y-4"><Card><CardTitle>Mistake detail</CardTitle><CardContent>Placeholder for mistake {id}. This page will load the question, answer, notes, tags, and explanation.</CardContent></Card><ExplainButton id={id} /></div>; }

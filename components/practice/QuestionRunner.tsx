import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AiBadge } from "./AiBadge";
export function QuestionRunner({ sessionId }: { sessionId: string }) { return <Card><CardTitle>Practice session <AiBadge /></CardTitle><CardContent>Session {sessionId} placeholder.</CardContent></Card>; }

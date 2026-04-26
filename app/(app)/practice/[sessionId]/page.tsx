import { QuestionRunner } from "@/components/practice/QuestionRunner";
export default function PracticeSessionPage({ params }: { params: { sessionId: string } }) { return <QuestionRunner sessionId={params.sessionId} />; }

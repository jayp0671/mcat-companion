import { QuestionRunner } from "@/components/practice/QuestionRunner";

type PageProps = { params: { sessionId: string } };
export default function PracticeSessionPage({ params }: PageProps) {
  return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-3xl font-bold">Practice session</h1><QuestionRunner sessionId={params.sessionId} /></div>;
}

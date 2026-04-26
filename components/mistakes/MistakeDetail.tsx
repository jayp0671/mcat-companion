import Link from "next/link";
import { formatDifficulty, formatSection } from "@/lib/utils/sections";
import { ExplainButton } from "@/components/mistakes/ExplainButton";

type MistakeDetailProps = {
  mistake: any;
};

export function MistakeDetail({ mistake }: MistakeDetailProps) {
  const question = mistake.question;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
            {formatSection(question?.section)}
          </span>
          <span>{question?.format === "passage" ? "Passage-based" : "Discrete"}</span>
          <span>Difficulty {formatDifficulty(question?.difficulty)}</span>
          {question?.source_material ? <span>{question.source_material}</span> : null}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">Mistake detail</h1>
        <p className="mt-2 text-sm text-slate-500">
          Logged {new Date(mistake.logged_at).toLocaleString()}
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Question stem</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{question?.stem}</p>
        </div>

        {question?.passage ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Passage context</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{question.passage}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your answer</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{mistake.her_selected_answer}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Correct</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{mistake.correct_answer}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Confidence</p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {mistake.her_confidence ? `${mistake.her_confidence}/5` : "Not logged"}
          </p>
        </div>
      </div>

      {question?.choices?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Choices</h2>
          <div className="mt-4 space-y-2">
            {[...question.choices]
              .sort((a: any, b: any) => a.position - b.position)
              .map((choice: any) => (
                <div
                  key={choice.id}
                  className={`rounded-xl border p-3 text-sm ${
                    choice.is_correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-semibold">{choice.label}.</span> {choice.text}
                </div>
              ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tags</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="font-medium text-slate-900">
              {question?.content_category?.name ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Topic</dt>
            <dd className="font-medium text-slate-900">{question?.topic?.name ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Subtopic</dt>
            <dd className="font-medium text-slate-900">{question?.subtopic?.name ?? "Not set"}</dd>
          </div>
        </dl>
      </div>

      <ExplainButton id={mistake.id} initialExplanation={question?.explanation ?? null} />

      {mistake.notes ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{mistake.notes}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/log" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">
          Back to log
        </Link>
        <Link href="/log/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Log another
        </Link>
      </div>
    </div>
  );
}

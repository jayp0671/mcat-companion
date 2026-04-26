import Link from "next/link";
import type { MistakeListItem } from "@/lib/mistakes/types";
import { formatDifficulty, formatSection } from "@/lib/utils/sections";

export function MistakeList({ mistakes }: { mistakes: MistakeListItem[] }) {
  if (mistakes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">No mistakes logged yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Start by logging one missed question from your real practice materials.
        </p>
        <Link
          href="/log/new"
          className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Log first mistake
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mistakes.map((mistake) => (
        <Link
          key={mistake.id}
          href={`/mistakes/${mistake.id}`}
          className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
              {formatSection(mistake.question?.section)}
            </span>
            <span>{mistake.question?.topic?.name ?? "Topic not set"}</span>
            <span>Difficulty {formatDifficulty(mistake.question?.difficulty)}</span>
            <span>{new Date(mistake.logged_at).toLocaleDateString()}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-900">
            {mistake.question?.stem ?? "Untitled mistake"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Chose {mistake.her_selected_answer}. Correct: {mistake.correct_answer}.
          </p>
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import type { MistakeListItem } from "@/lib/mistakes/types";
import { formatSection } from "@/lib/utils/sections";

export function RecentMistakes({ mistakes }: { mistakes: MistakeListItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent mistakes</h2>
          <p className="text-sm text-slate-500">Latest logged missed questions.</p>
        </div>
        <Link href="/log" className="text-sm font-semibold text-slate-900">
          View all
        </Link>
      </div>

      {mistakes.length === 0 ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          No mistakes yet. Log your first missed question to start building the dataset.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {mistakes.slice(0, 5).map((mistake) => (
            <Link
              href={`/mistakes/${mistake.id}`}
              key={mistake.id}
              className="block rounded-xl bg-slate-50 p-3 text-sm"
            >
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{formatSection(mistake.question?.section)}</span>
                <span>{mistake.question?.topic?.name ?? "Topic not set"}</span>
              </div>
              <p className="mt-1 line-clamp-1 font-medium text-slate-900">
                {mistake.question?.stem}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

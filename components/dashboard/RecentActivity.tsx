import Link from "next/link";

type RecentMistakeQuestion = {
  id: string;
  stem: string;
  section: string;
  source_material?: string | null;
  difficulty?: number | null;
  topic?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  content_category?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
};

type RecentMistake = {
  id: string;
  logged_at: string;
  her_selected_answer?: string | null;
  correct_answer?: string | null;
  question: RecentMistakeQuestion | null;
};

type RecentActivityProps = {
  mistakes?: RecentMistake[];
};

const sectionLabels: Record<string, string> = {
  chem_phys: "Chem/Phys",
  cars: "CARS",
  bio_biochem: "Bio/Biochem",
  psych_soc: "Psych/Soc",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function truncate(text: string, maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export function RecentActivity({ mistakes = [] }: RecentActivityProps) {
  const recentMistakes = mistakes.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Recent activity</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest logged mistakes from real practice materials.
          </p>
        </div>

        <Link
          href="/log"
          className="text-sm font-medium text-slate-700 hover:text-slate-950"
        >
          View all
        </Link>
      </div>

      {recentMistakes.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No mistakes logged yet. Start by logging one missed question after a
          practice session.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {recentMistakes.map((mistake) => {
            const question = mistake.question;
            const topicName = question?.topic?.name ?? question?.category?.name ?? question?.content_category?.name;

            return (
              <Link
                key={mistake.id}
                href={`/mistakes/${mistake.id}`}
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{formatDate(mistake.logged_at)}</span>

                    {question?.section ? (
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {sectionLabels[question.section] ?? question.section}
                      </span>
                    ) : null}

                    {topicName ? <span>{topicName}</span> : null}
                  </div>

                  {question?.difficulty ? (
                    <span className="text-xs text-slate-500">
                      Difficulty {question.difficulty}/5
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {question?.stem ? truncate(question.stem) : "Untitled logged mistake"}
                </p>

                {mistake.her_selected_answer || mistake.correct_answer ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {mistake.her_selected_answer ? (
                      <span>Your answer: {mistake.her_selected_answer}</span>
                    ) : null}
                    {mistake.her_selected_answer && mistake.correct_answer ? (
                      <span> · </span>
                    ) : null}
                    {mistake.correct_answer ? (
                      <span>Correct: {mistake.correct_answer}</span>
                    ) : null}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

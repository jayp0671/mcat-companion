import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeMistakeRows } from "@/lib/mistakes/normalize";
import { buildDashboardSummary } from "@/lib/services/dashboard";
import { DaysToExam } from "@/components/dashboard/DaysToExam";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { ReadinessGauge } from "@/components/dashboard/ReadinessGauge";
import { MasteryBar } from "@/components/dashboard/MasteryBar";
import { WeakTopicsList } from "@/components/dashboard/WeakTopicsList";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded_at) {
    redirect("/onboarding");
  }

  const { data: mistakes } = await supabase
    .from("mistake_log_entries")
    .select(
      `
      id,
      her_selected_answer,
      correct_answer,
      her_confidence,
      time_spent_seconds,
      notes,
      logged_at,
      question:questions (
        id,
        stem,
        passage,
        format,
        section,
        source_material,
        difficulty,
        content_category_id,
        topic_id,
        subtopic_id,
        topic:taxonomy_nodes!questions_topic_id_fkey (
          id,
          name,
          code
        ),
        category:taxonomy_nodes!questions_content_category_id_fkey (
          id,
          name,
          code
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(250);

  const normalizedMistakes = normalizeMistakeRows(mistakes ?? []) as unknown as Parameters<
  typeof buildDashboardSummary
>[0];

const summary = buildDashboardSummary(normalizedMistakes);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            MCAT Companion
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Track missed questions, surface patterns, and decide what to review next.
          </p>
        </div>

        <Link
          href="/log/new"
          className="rounded-xl bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
        >
          Log a mistake
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DaysToExam targetDate={profile.target_test_date} />
        <ProfileSummary profile={profile} />
        <ReadinessGauge value={summary.readiness} />
      </div>

      <div className="mt-4">
        <TodayCard recommendation={summary.todayRecommendation} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Section signal
              </h2>
              <p className="text-sm text-slate-500">
                Based on logged missed questions only. Correct-answer tracking comes later.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {summary.totalMistakes} logged
            </span>
          </div>

          <div className="space-y-4">
            {summary.sections.map((section) => (
              <MasteryBar
                key={section.section}
                label={section.label}
                value={section.mastery}
                detail={`${section.misses} misses · ${section.weakTopicCount} weak topics`}
              />
            ))}
          </div>
        </section>

        <WeakTopicsList topics={summary.weakTopics} />
      </div>

      <div className="mt-6">
        <RecentActivity mistakes={summary.recentMistakes} />
      </div>
    </main>
  );
}

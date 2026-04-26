import Link from "next/link";
import { redirect } from "next/navigation";
import { DaysToExam } from "@/components/dashboard/DaysToExam";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { RecentMistakes } from "@/components/dashboard/RecentMistakes";
import { TaxonomyPreview } from "@/components/dashboard/TaxonomyPreview";
import { getUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeMistakeListItems } from "@/lib/mistakes/normalize";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createSupabaseServerClient();

  const [{ data: profile }, { data: mistakes }, { count: taxonomyCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
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
            topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code)
          )
        `,
        )
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(5),
      supabase
        .from("taxonomy_nodes")
        .select("id", { count: "exact", head: true }),
    ]);

  if (!profile) {
    redirect("/onboarding");
  }

  const recentMistakes = normalizeMistakeListItems(mistakes);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">MCAT Companion</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back{profile.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Track missed questions, find patterns, and decide what to review next.
          </p>
        </div>
        <Link
          href="/log/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Log mistake
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <DaysToExam targetDate={profile.target_test_date} />
        <ProfileSummary profile={profile} mistakeCount={recentMistakes.length} />
        <TaxonomyPreview taxonomyCount={taxonomyCount ?? 0} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <RecentMistakes mistakes={recentMistakes} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s focus</h2>
          <p className="mt-2 text-sm text-slate-500">
            Phase 4 will turn your logged mistakes into weak-topic recommendations. For now,
            log missed questions right after practice so the dataset stays clean.
          </p>
          <Link
            href="/log/new"
            className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Add a missed question
          </Link>
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { DaysToExam } from "@/components/dashboard/DaysToExam";
import { MasteryBar } from "@/components/dashboard/MasteryBar";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { ReadinessGauge } from "@/components/dashboard/ReadinessGauge";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TaxonomyPreview } from "@/components/dashboard/TaxonomyPreview";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { WeakTopicsList } from "@/components/dashboard/WeakTopicsList";
import { getProfile, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function daysUntil(date: string | null) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!profile?.onboarded_at) {
    redirect("/onboarding");
  }

  const supabase = createSupabaseServerClient();
  const { data: taxonomyNodes } = await supabase
    .from("taxonomy_nodes")
    .select("id,name,code,level")
    .order("sort_order", { ascending: true });

  const days = daysUntil(profile.target_test_date ?? null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-950">
          Welcome back{profile.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-slate-600">
          This is the Phase 2 dashboard shell. Mistake logging and real analytics come next.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DaysToExam days={days} targetDate={profile.target_test_date ?? null} />
        <ReadinessGauge value={0} />
        <TodayCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileSummary
          displayName={profile.display_name ?? null}
          targetScore={profile.target_score ?? null}
          hoursPerWeek={profile.hours_per_week ?? null}
        />
        <TaxonomyPreview nodes={taxonomyNodes ?? []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MasteryBar />
        <WeakTopicsList />
      </div>
      <RecentActivity />
    </div>
  );
}

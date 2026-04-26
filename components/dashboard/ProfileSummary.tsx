type ProfileSummaryProps = {
  profile: {
    display_name: string | null;
    target_score: number | null;
    hours_per_week: number | null;
  };
};

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Profile</p>
      <h2 className="mt-3 text-2xl font-bold text-slate-950">
        {profile.display_name || "MCAT Student"}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Target</p>
          <p className="mt-1 font-semibold text-slate-950">
            {profile.target_score ?? "Not set"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Weekly hours</p>
          <p className="mt-1 font-semibold text-slate-950">
            {profile.hours_per_week ?? 0}
          </p>
        </div>
      </div>
    </section>
  );
}

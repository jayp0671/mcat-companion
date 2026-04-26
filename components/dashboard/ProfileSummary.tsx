type ProfileSummaryProps = {
  profile: {
    target_score: number | null;
    hours_per_week: number | null;
  };
  mistakeCount?: number;
};

export function ProfileSummary({ profile, mistakeCount = 0 }: ProfileSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">Study profile</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Target</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {profile.target_score ?? "Set"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Hours/wk</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {profile.hours_per_week ?? 0}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{mistakeCount} recent mistakes loaded.</p>
    </div>
  );
}

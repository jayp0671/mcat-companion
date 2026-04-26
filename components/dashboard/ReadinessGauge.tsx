type ReadinessGaugeProps = {
  value: number;
};

export function ReadinessGauge({ value }: ReadinessGaugeProps) {
  const safeValue = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Readiness signal</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-bold tracking-tight text-slate-950">
          {safeValue}
        </span>
        <span className="pb-1 text-sm text-slate-500">/ 100</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-950"
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Directional coverage signal only. This is not a score predictor. AAMC full-length exams are still the best score estimate.
      </p>
    </section>
  );
}

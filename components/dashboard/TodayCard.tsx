export function TodayCard({ recommendation }: { recommendation: string }) {
  return (
    <section className="rounded-2xl border bg-slate-950 p-5 text-white shadow-sm">
      <p className="text-sm font-medium text-slate-300">Today&apos;s focus</p>
      <p className="mt-2 text-lg font-semibold">{recommendation}</p>
    </section>
  );
}

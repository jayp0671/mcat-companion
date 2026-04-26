type WeakTopic = {
  id: string;
  name: string;
  code: string | null;
  section: string;
  misses: number;
  lastMissedAt: string;
  confidence: number;
  mastery: number;
};

const sectionLabels: Record<string, string> = {
  chem_phys: "Chem/Phys",
  cars: "CARS",
  bio_biochem: "Bio/Biochem",
  psych_soc: "Psych/Soc",
};

export function WeakTopicsList({ topics }: { topics: WeakTopic[] }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Weak topics</h2>
        <p className="text-sm text-slate-500">
          Ranked from the missed-question log.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          No weak topic pattern yet. Log a few missed questions to populate this list.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">
                    {topic.code ? `${topic.code} · ` : ""}
                    {topic.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sectionLabels[topic.section] ?? topic.section} · {topic.misses} missed
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  {Math.round(topic.mastery)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

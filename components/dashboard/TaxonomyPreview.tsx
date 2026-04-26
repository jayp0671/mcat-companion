export function TaxonomyPreview({ taxonomyCount }: { taxonomyCount: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">Taxonomy</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{taxonomyCount}</p>
      <p className="mt-2 text-sm text-slate-500">MCAT nodes available for tagging.</p>
    </div>
  );
}

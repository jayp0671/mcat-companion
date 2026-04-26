import { Select } from "@/components/ui/select";
import { mcatSections } from "@/lib/constants";
export function TaxonomyPicker() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Section<Select name="section">{mcatSections.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></label>
      <label className="text-sm font-medium">Topic<InputPlaceholder name="topic" placeholder="e.g. Amino acids" /></label>
    </div>
  );
}
function InputPlaceholder({ name, placeholder }: { name: string; placeholder: string }) {
  return <input name={name} placeholder={placeholder} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />;
}
